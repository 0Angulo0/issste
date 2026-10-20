# Seguridad del Padrón Infantil: contraseñas con bcrypt

Este documento explica **cómo y por qué** se protegen las contraseñas en el Padrón Infantil. Está pensado para quien mantenga el sistema y no necesita conocimientos previos de criptografía.

> Estado: completo para el prototipo. Contraseñas con bcrypt, sesiones, primer acceso (familias y personal), reglas de contraseña, límite de intentos, restablecer acceso, **permisos por rol en el servidor** y **bitácora de auditoría**.

---

## 1. ¿Por qué no guardamos las contraseñas tal cual?

Si `db.json` (o la base de datos de producción) se filtrara, cualquiera podría leer las contraseñas y entrar con la cuenta de un tutor o de un administrador. Además, mucha gente reutiliza la misma contraseña en otros servicios.

Por eso **nunca** guardamos la contraseña. Guardamos un **hash**: el resultado de pasar la contraseña por una función matemática de un solo sentido.

```
"Padron#2026"  ──bcrypt──►  $2b$12$Q9...x7e   (no se puede regresar al texto original)
```

## 2. ¿Qué es bcrypt y por qué ese y no otro?

bcrypt es un algoritmo diseñado específicamente para contraseñas. Tiene tres propiedades importantes:

| Propiedad             | Qué significa                                                                             | Por qué importa                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Un solo sentido**   | Del hash no se puede obtener la contraseña.                                               | Si roban la base de datos, no obtienen las contraseñas.                                                          |
| **Salt automático**   | Antes de calcular, bcrypt agrega un valor aleatorio (salt) distinto para cada contraseña. | Dos personas con la misma contraseña tienen hashes diferentes, y no sirven las "tablas" de hashes precalculados. |
| **Lento a propósito** | Repite su cálculo 2^rondas veces (usamos 12 rondas = 4,096 veces, unos 250 ms).           | Un usuario no nota la espera, pero un atacante que quiere probar millones de contraseñas tardaría años.          |

Algoritmos como MD5 o SHA-256 **no** sirven para contraseñas porque son muy rápidos: una tarjeta de video puede probar miles de millones por segundo.

### Anatomía de un hash bcrypt

```
$2b$12$Nm/QzdKElD2wWxYqhv1U3uJEeVJE9wYBnRmQ6IZh1By8VWsQLTouW
 │   │  └──── salt (22 caracteres) ───┘└──── hash (31 caracteres) ────┘
 │   └─ rondas (12 → 2^12 repeticiones)
 └─ versión del algoritmo
```

El salt y las rondas viajan **dentro** del hash. Por eso no hay que guardarlos aparte, y por eso se puede subir el número de rondas en el futuro sin romper las contraseñas existentes.

## 3. ¿Dónde se usa bcrypt en el código?

**Solo en el servidor** (carpeta `server/`). El navegador nunca hashea ni compara contraseñas, y nunca recibe un hash:

- Si el hash se calculara en el navegador, lo que viajaría por la red sería el hash, y ese hash funcionaría como si fuera la contraseña.
- El código del navegador lo puede leer y modificar cualquier persona.

| Archivo | Qué hace |
| --- | --- |
| `server/seguridad.js` | `hashearContrasena()`, `compararContrasena()`, sesiones (crear, cerrar, cerrar todas las de una cuenta), claves PI-/AC- y límite de intentos. |
| `server/server.js` | Rutas `/auth/*` (login, primer acceso, logout, restablecer), altas de infantes y usuarios. Quita secretos de **todas** las respuestas y escrituras. |
| `server/permisos.js` | Qué ve y qué hace cada rol (sección 8). |
| `server/bitacora.js` | Bitácora de auditoría (sección 9). |
| `server/semilla.js` | Crea `db.json` con datos de ejemplo; las contraseñas de prueba se guardan ya hasheadas. |
| `src/utils/reglasContrasena.js` | Reglas de contraseña segura, **compartidas** por navegador y servidor. |
| `src/providers/authProvider.ts` | Envía usuario y contraseña al servidor y guarda el **token** que recibe, nunca la contraseña. |
| `src/pages/LoginPage.tsx`, `src/pages/PrimerAcceso.tsx` | Pantallas de inicio de sesión y de creación de contraseña. |

El paquete que usamos es [`bcrypt`](https://www.npmjs.com/package/bcrypt), que es nativo de Node.js. Existe también `bcryptjs`, una versión hecha solo en JavaScript; aquí no la necesitamos porque bcrypt solo corre en el servidor.

### Las dos funciones de bcrypt que usamos

```js
// Al CREAR una contraseña (primer acceso): texto plano -> hash
const passwordHash = await bcrypt.hash("Girasol#Azul7", 12);
// "$2b$12$..."  <- esto es lo único que se guarda en db.json

// Al INICIAR SESIÓN: ¿la contraseña escrita corresponde al hash guardado?
const correcta = await bcrypt.compare("Girasol#Azul7", passwordHash); // true
```

Las dos son `async` porque tardan unos 250 ms a propósito; usar `await` evita que el servidor se congele mientras calcula.

## 4. Flujo de inicio de sesión

```
Navegador                              Servidor (server.js)
─────────                              ────────────────────
usuario + contraseña  ── POST /auth/login ──►  0. ¿Esa IP + usuario está bloqueada? -> 429
                                               1. Busca la cuenta:
                                                  - con "@"  → usuarios (personal)
                                                  - sin "@"  → tutores (clave PI-XXXXXX)
                                               2. bcrypt.compare(contraseña, passwordHash)
                                               3. Tutor sin contraseña -> 403 "primer acceso pendiente"
                                               4. Si no coincide: suma una falla, 401 genérico
◄── { token, id, rol, nombre } ──────────────  5. Si coincide: borra fallas y crea un token
Guarda el token en localStorage
Cada petición lleva:  Authorization: Bearer <token>
```

Decisiones de seguridad en este flujo:

- **Mensaje de error genérico.** Nunca decimos si lo que falló fue el usuario o la contraseña, para no revelar qué cuentas existen.
- **Tiempo constante.** Aunque la cuenta no exista, igual se llama a `bcrypt.compare`, para que el tiempo de respuesta no delate si un correo está registrado.
- **Cuentas inactivas.** Un usuario dado de baja (`activo: false`) no puede iniciar sesión.
- **Token, no contraseña.** Después del login el navegador solo tiene un token aleatorio de 64 caracteres. Al cerrar sesión el servidor lo invalida.
- **Excepción consciente:** a un tutor cuya clave existe pero aún no tiene contraseña le decimos que vaya a "Primer acceso". Esto revela que la clave existe, pero las claves son aleatorias (31⁶ ≈ 887 millones de combinaciones) y el límite de intentos impide adivinarlas.

## 5. Primer acceso (familias y personal) y restablecer acceso

Nadie recibe una contraseña inventada por otra persona: cada quien crea la suya con una **clave de un solo uso**.

| Quién | Cómo recibe su clave | Con qué entra después |
| --- | --- | --- |
| Padre, madre o tutor | La estancia da de alta al infante → el servidor crea la cuenta del tutor con clave `PI-XXXXXX` y `passwordHash: null` | Su clave `PI-…` + su contraseña |
| Personal (admin, coordinación, estancia) | El administrador lo da de alta → clave de activación `AC-XXXXXX` | Su correo + su contraseña (la clave `AC-` deja de servir) |

Pasos en "¿Es tu primera vez?" (`/primer-acceso`, ruta `POST /auth/primer-acceso`):

1. La persona escribe su clave y su nueva contraseña dos veces; mientras escribe, ve qué requisitos cumple (✓/✗).
2. El servidor revisa que la clave exista, que la cuenta **no tenga contraseña todavía** y que esté activa (una cuenta dada de baja no se puede activar).
3. Valida **todas** las reglas (incluida la de datos personales) y guarda **solo** `bcrypt.hash(contraseña, 12)`.
4. Regresa al login con el usuario ya escrito (clave o correo) para entrar con la contraseña nueva.

**Restablecer acceso** (`POST /auth/restablecer`, botón con confirmación):
- La **estancia** puede restablecer a las familias de sus infantes; el **admin**, al personal.
- El servidor genera una clave nueva, **borra la contraseña** (`passwordHash: null`) y **cierra todas las sesiones abiertas** de esa cuenta. La persona vuelve a pasar por "Primer acceso".
- La pantalla muestra la clave nueva una sola vez, en un aviso, para entregarla.

## 6. Reglas de contraseña segura

| Regla                                                                                                                                                              | Dónde se revisa      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| Al menos 8 caracteres                                                                                                                                              | navegador y servidor |
| Al menos una mayúscula, una minúscula, un número y un carácter especial                                                                                            | navegador y servidor |
| Sin espacios                                                                                                                                                       | navegador y servidor |
| No ser una contraseña común (`password`, `qwerty`, `admin`, `issste`…). Se comparan solo las letras: `Password123!` cuenta como `password`                         | navegador y servidor |
| No contener el nombre del tutor, el nombre o apellidos de sus hijos, su ciudad, ni fechas de nacimiento (`2024`, `1502`, `0215`, `150224`, `15022024`, `20240215`) | **solo servidor**    |

¿Por qué la última regla solo la revisa el servidor? Para revisarla en el navegador habría que enviarle el nombre, la fecha de nacimiento y la ciudad de la familia a **cualquiera que escriba una clave**. Preferimos no exponer esos datos; si la contraseña los contiene, el servidor responde con la lista de reglas que fallaron y la pantalla marca esa regla con ✗.

Para agregar o cambiar una regla basta con editar `src/utils/reglasContrasena.js` (y su mensaje en `src/providers/i18nProvider.ts`, sección `contrasena.reglas`). El cambio aplica en ambos lados.

## 7. Límite de intentos y protección de la API

- **5 intentos fallidos** desde la misma IP con el mismo usuario (o la misma clave en primer acceso) bloquean ese usuario en esa IP durante **15 minutos** (respuesta 429). Se configura con `MAX_INTENTOS` y `MINUTOS_BLOQUEO` en `seguridad.js`.
- Toda la API, salvo `/auth/login`, `/auth/primer-acceso` y `/auth/logout`, exige un token válido (si no lo hay: **401** y el navegador cierra la sesión).
- **Campos que solo escribe el servidor**: `id`, `passwordHash`, `claveAcceso`, `claveActivacion`, `registradoPor` y `expediente` se borran de cualquier petición que mande el navegador.
- **Nunca se envían secretos**: ninguna respuesta incluye `passwordHash` ni `claveActivacion`. En su lugar va `tieneContrasena: true/false` (para mostrar "Falta primer acceso").
- `PUT` se trata como `PATCH`: solo cambia los campos enviados. Si no, editar un registro desde la pantalla borraría campos que el navegador nunca recibe (como el hash).
- **401 ≠ 403**: 401 = "no hay sesión" (se cierra la sesión); 403 = "no tienes permiso para este dato" (se muestra el error y la persona sigue dentro).

## 8. Permisos por rol (server/permisos.js)

Ocultar un botón en la pantalla **no** es seguridad: cualquiera puede llamar la API directamente. Por eso el servidor revisa cada petición con la sesión de quien la hace.

**Alcance** de cada rol (qué infantes y estancias "le tocan"):

| Rol | Alcance |
| --- | --- |
| admin | Todo |
| coordinador | Estancias de **su región** y sus infantes |
| estancia | **Su estancia** y sus infantes |
| tutor | **Sus hijos** y la estancia de cada uno |

**Qué puede hacer** cada rol en cada colección (D = nadie puede borrar; las personas se "dan de baja"):

| Colección | Leer | Crear | Editar |
| --- | --- | --- | --- |
| infantes | todos (dentro de su alcance) | admin, estancia (ruta propia, crea también al tutor) | admin, estancia (sin cambiar estancia ni tutor) |
| mediciones | todos (dentro de su alcance) | estancia (rangos válidos, sin fechas futuras, 1 por día) | **solo admin** (corrección con motivo obligatorio) |
| estancias | todos (dentro de su alcance) | — | admin |
| tutores | admin, estancia (para ver la clave de la familia) | — (los crea el alta de infante) | admin |
| usuarios | admin | admin (ruta propia, con clave AC-) | admin (no puede darse de baja a sí mismo) |
| bitacora | admin | — (solo el servidor) | — |
| indicadores | admin, coordinador, estancia (totales de su alcance) | — | — |

Cómo se aplica: antes de json-server se agregan filtros a la búsqueda (ej. `?infanteId=1&infanteId=2` con los permitidos) y se rechaza lo prohibido (403). Después, `filtrarRespuesta` quita de la respuesta cualquier registro fuera del alcance (red de seguridad). Pedir por id un registro ajeno responde **404**, como si no existiera.

## 9. Bitácora de auditoría (server/bitacora.js)

Equivale a la colección `log` del ejemplo del profe. Registra **quién** (usuario y rol), **qué** (acción), **sobre qué** (recurso y registro), **cuándo** (fecha y hora) y un **detalle**:

- Inicios de sesión correctos y **fallidos** (en el detalle va el usuario que se intentó, nunca la contraseña).
- Primer acceso, altas, ediciones, bajas, restablecimientos.
- Correcciones de mediciones **con su motivo**.

Solo la escribe el servidor; nadie puede crear, editar ni borrar registros de la bitácora por la API. El administrador la consulta en "Bitácora" (solo lectura, con filtros).

## 10. Limitaciones conocidas del servidor de desarrollo

Este servidor es un **prototipo**. En el repo final (Express + MongoDB, como el ejemplo del profe) hay que:

1. Usar **JWT firmados con expiración** (llave en `.env`) en lugar de sesiones en memoria, y guardar el contador de intentos fuera de la memoria.
2. Servir todo por **HTTPS** (certificados en backend y en Vite).
3. Usar **argon2** si así lo pide el ejemplo (mismo flujo: `hash` al crear, `verify` con `await` al iniciar sesión).
4. Validar en Mongo los filtros que llegan en la URL (no pasar `req.query` directo a `find`, para evitar inyección NoSQL).
5. Revisar el token en **todas** las rutas, incluidas `POST`, `PUT` y `DELETE`.

## 11. Cuentas de prueba

Se generan con `npm run semilla` (después hay que **reiniciar** `npm run server`, porque el servidor guarda los datos en memoria). Contraseña: `Padron#2026`.

| Usuario | Rol |
| --- | --- |
| `admin@issste.gob.mx` | Administrador |
| `coordinador.centro@issste.gob.mx` | Coordinador regional (Centro) |
| `coordinador.norte@issste.gob.mx` | Coordinador regional (Norte) |
| `personal.ebdi35@issste.gob.mx` | Personal de estancia (EBDI 35 Coyoacán) |
| `personal.ebdi12@issste.gob.mx` | Personal de estancia (EBDI 12 Tlalpan) |
| `personal.ebdi41@issste.gob.mx` | Personal dado de baja (no puede entrar) |
| `PI-7K3M9Q` | Tutora de Sofía y Diego (dos hijos) |
| `PI-9RT2WK` | Tutora de Regina y Emiliano (EBDI 12) |

Sin contraseña, para probar "Primer acceso" (por ejemplo con `Girasol#Azul7`):

| Clave | Cuenta |
| --- | --- |
| `PI-4H8R2T` | Tutor de Mateo |
| `AC-7H4K2M` | Personal nuevo (`nuevo.personal@issste.gob.mx`, EBDI 07) |
