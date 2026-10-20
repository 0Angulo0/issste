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

Las cuentas de prueba están en [server/README_SEGURIDAD.md](server/README_SEGURIDAD.md#11-cuentas-de-prueba).

## Otros comandos

| Comando | Para qué sirve |
|---|---|
| `npm run type-check` | Revisa los tipos de TypeScript |
| `npm run lint` | Revisa y corrige el estilo del código |
| `npm run build` | Genera la versión de producción en `dist/` |

## Qué puede hacer cada rol

| Rol | Pantallas |
| --- | --- |
| **Personal de estancia** | Inicio (resumen del mes y "Pendientes de medir"), Infantes (lista, alta con clave para la familia, expediente), Mediciones (captura con validaciones), Gráficas (curvas de crecimiento CDC). Puede restablecer el acceso de las familias. |
| **Padre, madre o tutor** | Inicio (estado en palabras sencillas, medición reciente y gráfica), Gráficas, Historial. Solo ve a sus hijos. |
| **Coordinador regional** | Indicadores de su región (filtros, cumplimiento de captura, estado nutricional), Gráficas, Cumplimiento de captura, Reportes CSV. Solo lectura. |
| **Administrador** | Panel general (filtros por estado, región y estancia), Gráficas, Usuarios (alta con clave de activación, editar rol, dar de baja, restablecer contraseña), Correcciones de registro (con motivo), Infantes, Estancias, Bitácora y Reportes. |

## Organización del código

```
server/                   API de desarrollo (json-server + bcrypt)
  server.js               rutas propias, protección de la API y orden de los middlewares
  seguridad.js            contraseñas (bcrypt), sesiones, claves PI-/AC-, límite de intentos
  permisos.js             qué ve y qué hace cada rol (también filtra las respuestas)
  bitacora.js             registro de auditoría
  indicadores.js          totales de los paneles (captura al día, alertas, estado nutricional)
  semilla.js              genera db.json con datos de ejemplo realistas
  convertirCDC.js         convierte las tablas CSV de los CDC a src/utils/tablasCDC.js
  datos/cdc/              tablas oficiales de crecimiento de los CDC (CSV)
  README_SEGURIDAD.md     explicación detallada de seguridad, permisos y bitácora
src/
  App.tsx                 <Admin>: decide recursos y rutas según el rol
  providers/              authProvider, dataProvider (con getIndicadores y restablecerAcceso), i18nProvider
  theme/                  colores de la Guía de Identidad y tema accesible
  layout/                 barra superior, menú por rol y layout
  pages/                  pantallas sin sesión: inicio de sesión y primer acceso
  roles/<rol>/            pantallas de cada rol (estancia, tutor, coordinador, admin)
  components/             piezas compartidas (avisos, botones, encabezado, tablas)
    graficas/             curvas de crecimiento y barras (chart.js), panel de curvas
    paneles/              filtros, indicadores, cumplimiento, reportes, detalle de estancia
  hooks/                  useCrecimiento (mediciones + evaluación CDC), useIndicadores
  utils/                  compartidos con el servidor (reglas de contraseña, rangos, cálculos CDC) y fechas
  recursos/               logotipos
```

Los archivos `.js` de `src/utils/` (con su `.d.ts`) los usan **el navegador y el servidor**: así las reglas de contraseña, los rangos de las medidas y la clasificación nutricional son siempre las mismas en los dos lados.

### Crecimiento y estado nutricional

- Tablas de los CDC (https://www.cdc.gov/growthcharts/percentile_data_files.htm), método LMS. Se calculan percentiles exactos para: peso, talla y perímetro cefálico para la edad, peso para la talla e IMC para la edad.
- Clasificación: en menores de 2 años se usa el peso para la talla (debajo de P3 = bajo, arriba de P97 = alto); desde los 2 años, el IMC para la edad (debajo de P5 = bajo, P85 a P95 = sobrepeso, P95 o más = obesidad). Talla para la edad debajo de P3 = talla baja.
- "Captura al día": la estancia tiene al menos una medición en el mes.

### Accesibilidad (Evidencia 1.1)

- Todo se puede usar con teclado; el foco siempre se ve (anillo azul).
- Cada campo tiene etiqueta visible y texto de ayuda; los errores llevan icono y texto y el campo se marca `aria-invalid`.
- Los avisos importantes usan `role="status"` o `role="alert"` (guardado, filtros aplicados, claves nuevas, errores).
- Las gráficas no dependen solo del color (tipo de línea y forma de punto), tienen leyenda en texto, descripción para lector de pantalla y "Ver como tabla".
- Botones con texto visible también en celular; sin desplazamiento horizontal a 375 px.

### ¿Cómo se logra que cada rol vea algo distinto?

1. Al iniciar sesión, el servidor regresa el rol del usuario.
2. `authProvider.getPermissions()` entrega ese rol a react-admin.
3. En `App.tsx`, los hijos de `<Admin>` son una función del rol. Cada rol registra solo sus recursos y rutas, definidos en `src/roles/<rol>/rutas.tsx`.
4. `layout/Menu.tsx` muestra el menú del rol y `roles/Dashboard.tsx` elige su pantalla de Inicio.
5. Además, **el servidor** filtra los datos por rol (`server/permisos.js`): aunque alguien escriba una URL o llame la API directamente, solo recibe lo que le corresponde.

Para agregar una pantalla a un rol, se agrega su `<Route>` o `<Resource>` en `roles/<rol>/rutas.tsx` y su opción en `layout/Menu.tsx`.
