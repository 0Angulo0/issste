# Seguridad del Padrón Infantil: contraseñas con bcrypt

Este documento explica **cómo y por qué** se protegen las contraseñas en el Padrón Infantil. Está pensado para quien mantenga el sistema y no necesita conocimientos previos de criptografía.

> Estado: listos el login con bcrypt, las sesiones, el **primer acceso del tutor**, las **reglas de contraseña segura** y el **límite de intentos** (secciones 4 a 7). Falta la generación de la clave al dar de alta un infante, que se hará con la pantalla de alta de infantes.

---

## 1. ¿Por qué no guardamos las contraseñas tal cual?

Si `db.json` (o la base de datos de producción) se filtrara, cualquiera podría leer las contraseñas y entrar con la cuenta de un tutor o de un administrador. Además, mucha gente reutiliza la misma contraseña en otros servicios.

Por eso **nunca** guardamos la contraseña. Guardamos un **hash**: el resultado de pasar la contraseña por una función matemática de un solo sentido.

```
"Padron#2026"  ──bcrypt──►  $2b$12$Q9...x7e   (no se puede regresar al texto original)
```

## 2. ¿Qué es bcrypt y por qué ese y no otro?

bcrypt es un algoritmo diseñado específicamente para contraseñas. Tiene tres propiedades importantes:

| Propiedad | Qué significa | Por qué importa |
|---|---|---|
| **Un solo sentido** | Del hash no se puede obtener la contraseña. | Si roban la base de datos, no obtienen las contraseñas. |
| **Salt automático** | Antes de calcular, bcrypt agrega un valor aleatorio (salt) distinto para cada contraseña. | Dos personas con la misma contraseña tienen hashes diferentes, y no sirven las "tablas" de hashes precalculados. |
| **Lento a propósito** | Repite su cálculo 2^rondas veces (usamos 12 rondas = 4,096 veces, unos 250 ms). | Un usuario no nota la espera, pero un atacante que quiere probar millones de contraseñas tardaría años. |

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
|---|---|
| `server/seguridad.js` | Concentra todo: `hashearContrasena()`, `compararContrasena()`, sesiones, claves de acceso y límite de intentos. |
| `server/server.js` | Rutas `POST /auth/login`, `POST /auth/primer-acceso` y `POST /auth/logout`. Quita `passwordHash` de **todas** las respuestas y de **todas** las escrituras de la API. |
| `server/semilla.js` | Crea `db.json` con datos de ejemplo. Las contraseñas de prueba se guardan ya hasheadas. |
| `src/utils/reglasContrasena.js` | Reglas de contraseña segura. Es **un solo archivo compartido** por navegador y servidor, para que las reglas nunca se contradigan. |
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

## 5. Primer acceso del tutor

1. Al dar de alta a un infante, el sistema crea una cuenta de tutor con una **clave de acceso** aleatoria (`PI-7K3M9Q`) y **sin contraseña** (`passwordHash: null`). La estancia entrega la clave a la familia.
2. El tutor abre "¿Es tu primera vez? Crea tu contraseña" (`/primer-acceso`), escribe la clave y su nueva contraseña dos veces.
3. Mientras escribe, ve qué requisitos cumple (✓/✗). Esto es solo una ayuda.
4. El servidor (`POST /auth/primer-acceso`) hace la revisión real:
   - la clave debe existir y **no haberse usado** (si ya tiene contraseña: 400, "clave no válida o ya usada");
   - la contraseña debe cumplir **todas** las reglas, incluyendo la de datos personales;
   - si todo está bien: `bcrypt.hash` y se guarda **solo** el hash.
5. El tutor regresa al login con su clave ya escrita y entra con su nueva contraseña.

Si una familia pierde su contraseña, la estancia debe generar una clave nueva (se implementará con la gestión de infantes).

## 6. Reglas de contraseña segura

| Regla | Dónde se revisa |
|---|---|
| Al menos 8 caracteres | navegador y servidor |
| Al menos una mayúscula, una minúscula, un número y un carácter especial | navegador y servidor |
| Sin espacios | navegador y servidor |
| No ser una contraseña común (`password`, `qwerty`, `admin`, `issste`…). Se comparan solo las letras: `Password123!` cuenta como `password` | navegador y servidor |
| No contener el nombre del tutor, el nombre o apellidos de sus hijos, su ciudad, ni fechas de nacimiento (`2024`, `1502`, `0215`, `150224`, `15022024`, `20240215`) | **solo servidor** |

¿Por qué la última regla solo la revisa el servidor? Para revisarla en el navegador habría que enviarle el nombre, la fecha de nacimiento y la ciudad de la familia a **cualquiera que escriba una clave**. Preferimos no exponer esos datos; si la contraseña los contiene, el servidor responde con la lista de reglas que fallaron y la pantalla marca esa regla con ✗.

Para agregar o cambiar una regla basta con editar `src/utils/reglasContrasena.js` (y su mensaje en `src/providers/i18nProvider.ts`, sección `contrasena.reglas`). El cambio aplica en ambos lados.

## 7. Límite de intentos y protección de la API

- **5 intentos fallidos** desde la misma IP con el mismo usuario (o la misma clave en primer acceso) bloquean ese usuario en esa IP durante **15 minutos** (respuesta 429). Se configura con `MAX_INTENTOS` y `MINUTOS_BLOQUEO` en `seguridad.js`.
- Toda la API, salvo `/auth/*`, exige un token válido (si no lo hay: 401).
- Ninguna respuesta incluye `passwordHash`, y ninguna petición puede escribirlo (`PATCH /tutores/1 { passwordHash: ... }` se ignora). Las contraseñas **solo** cambian por `/auth/*`.

## 8. Limitaciones conocidas del servidor de desarrollo

Este servidor es para **desarrollo y demostración**. Antes de usarlo en producción hay que:

1. Guardar las sesiones y el contador de intentos en una base de datos, o usar JWT firmados con expiración. Hoy viven en memoria y se pierden al reiniciar el servidor.
2. Servir todo por **HTTPS**, para que la contraseña no viaje en texto plano por la red.
3. Restringir por rol las rutas de la API (se irá agregando pantalla por pantalla).
4. Agregar el restablecimiento de contraseña del personal desde el panel del administrador.

## 9. Cuentas de prueba

Se generan con `npm run semilla` (después hay que **reiniciar** `npm run server`, porque el servidor guarda los datos en memoria). Todas usan la contraseña `Padron#2026`.

| Usuario | Rol |
|---|---|
| `admin@issste.gob.mx` | Administrador |
| `coordinador.centro@issste.gob.mx` | Coordinador regional (Centro) |
| `personal.ebdi35@issste.gob.mx` | Personal de estancia (EBDI 35) |
| `PI-7K3M9Q` | Tutor de Sofía Martínez López |
| `PI-4H8R2T` | Tutor de Mateo, **sin contraseña** (para probar el primer acceso; por ejemplo `Girasol#Azul7`) |
