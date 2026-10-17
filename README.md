# Padrón Infantil · ISSSTE

Plataforma de Crecimiento y Desarrollo Saludable para registrar, consultar y dar seguimiento a la información antropométrica de niñas y niños atendidos en las Estancias para el Bienestar y Desarrollo Infantil (EBDI).

Hecha con [react-admin](https://marmelab.com/react-admin/) y diseñada con criterios de accesibilidad (principios POUR / WCAG 2.1 AA).

## Requisitos

- Node.js 20 o superior

## Cómo ejecutar el proyecto

```sh
npm install        # instalar dependencias (solo la primera vez)
npm run semilla    # crear server/db.json con datos de ejemplo (sobrescribe los datos;
                   # si el servidor ya estaba corriendo, reinícialo)
npm run server     # terminal 1: API en http://localhost:3000
npm run dev        # terminal 2: aplicación en http://localhost:5173
```

Las cuentas de prueba están en [server/README_SEGURIDAD.md](server/README_SEGURIDAD.md#9-cuentas-de-prueba).

## Otros comandos

| Comando | Para qué sirve |
|---|---|
| `npm run type-check` | Revisa los tipos de TypeScript |
| `npm run lint` | Revisa y corrige el estilo del código |
| `npm run build` | Genera la versión de producción en `dist/` |

## Organización del código

```
server/                 API de desarrollo (json-server + bcrypt)
  server.js             rutas /auth/* y protección de la API
  seguridad.js          hash de contraseñas, sesiones, claves de acceso
  semilla.js            genera db.json con datos de ejemplo
  README_SEGURIDAD.md   explicación detallada de bcrypt
src/
  App.tsx               <Admin>: decide recursos y rutas según el rol
  providers/            authProvider, dataProvider, i18nProvider (español)
  theme/                colores de la Guía de Identidad y tema
  layout/               barra superior y menú (distinto para cada rol)
  roles/<rol>/          pantallas de cada rol (tutor, estancia, coordinador, admin)
  components/           piezas compartidas entre roles
  utils/                cálculos (edad, percentiles, validaciones)
  recursos/             logotipos
CLAUDE.md               estado del proyecto, decisiones y siguientes pasos
```

### ¿Cómo se logra que cada rol vea algo distinto?

1. Al iniciar sesión, el servidor regresa el rol del usuario.
2. `authProvider.getPermissions()` entrega ese rol a react-admin.
3. En `App.tsx`, los hijos de `<Admin>` son una función del rol. Cada rol registra solo sus recursos y rutas, definidos en `src/roles/<rol>/rutas.tsx`.
4. `layout/Menu.tsx` muestra el menú del rol y `roles/Dashboard.tsx` elige su pantalla de Inicio.

Para agregar una pantalla a un rol, se agrega su `<Route>` o `<Resource>` en `roles/<rol>/rutas.tsx` y su opción en `layout/Menu.tsx`.
