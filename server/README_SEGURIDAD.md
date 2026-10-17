# Seguridad del Padrón Infantil: contraseñas con bcrypt

Este documento explica **cómo y por qué** se protegen las contraseñas en el Padrón Infantil. Está pensado para quien mantenga el sistema y no necesita conocimientos previos de criptografía.

> Estado: se irá completando. En el **paso 1** quedaron listos el login con bcrypt y las sesiones. El **primer acceso del tutor** y las **reglas de contraseña segura** se agregan en la Pantalla 1 (ver `docs/PLAN.md`).

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
| `server/seguridad.js` | Concentra todo: `hashearContrasena()`, `compararContrasena()`, las sesiones y la generación de claves de acceso. |
| `server/server.js` | Ruta `POST /auth/login`. Además, quita `passwordHash` de **todas** las respuestas de la API (`router.render`). |
| `server/semilla.js` | Crea `db.json` con datos de ejemplo. Las contraseñas de prueba se guardan ya hasheadas. |
| `src/providers/authProvider.ts` | Envía usuario y contraseña al servidor y guarda el **token** que recibe, nunca la contraseña. |

El paquete que usamos es [`bcrypt`](https://www.npmjs.com/package/bcrypt), que es nativo de Node.js. Existe también `bcryptjs`, una versión hecha solo en JavaScript; aquí no la necesitamos porque bcrypt solo corre en el servidor.

## 4. Flujo de inicio de sesión

```
Navegador                              Servidor (server.js)
─────────                              ────────────────────
usuario + contraseña  ── POST /auth/login ──►  1. Busca la cuenta:
                                                  - con "@"  → usuarios (personal)
                                                  - sin "@"  → tutores (clave PI-XXXXXX)
                                               2. bcrypt.compare(contraseña, passwordHash)
                                               3. Si coincide: crea un token aleatorio
◄── { token, id, rol, nombre } ──────────────  4. Si no: 401 "Usuario o contraseña incorrectos"
Guarda el token en localStorage
Cada petición lleva:  Authorization: Bearer <token>
```

Decisiones de seguridad en este flujo:

- **Mensaje de error genérico.** Nunca decimos si lo que falló fue el usuario o la contraseña, para no revelar qué cuentas existen.
- **Tiempo constante.** Aunque la cuenta no exista, igual se llama a `bcrypt.compare`, para que el tiempo de respuesta no delate si un correo está registrado.
- **Cuentas inactivas.** Un usuario dado de baja (`activo: false`) no puede iniciar sesión.
- **Token, no contraseña.** Después del login el navegador solo tiene un token aleatorio de 64 caracteres. Al cerrar sesión el servidor lo invalida.

## 5. Limitaciones conocidas del servidor de desarrollo

Este servidor es para **desarrollo y demostración**. Antes de usarlo en producción hay que:

1. Guardar las sesiones en una base de datos o usar JWT firmados con expiración. Hoy viven en memoria y se pierden al reiniciar el servidor.
2. Servir todo por **HTTPS**, para que la contraseña no viaje en texto plano por la red.
3. Limitar los intentos de login (por ejemplo, 5 intentos y luego bloqueo temporal).
4. Restringir por rol las rutas de la API (se irá agregando pantalla por pantalla).

## 6. Cuentas de prueba

Se generan con `npm run semilla`. Todas usan la contraseña `Padron#2026`.

| Usuario | Rol |
|---|---|
| `admin@issste.gob.mx` | Administrador |
| `coordinador.centro@issste.gob.mx` | Coordinador regional (Centro) |
| `personal.ebdi35@issste.gob.mx` | Personal de estancia (EBDI 35) |
| `PI-7K3M9Q` | Tutor de Sofía Martínez López |
| `PI-4H8R2T` | Tutor sin contraseña (para probar el primer acceso) |
