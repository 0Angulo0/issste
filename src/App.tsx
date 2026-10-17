import { Admin } from "react-admin";
import { authProvider } from "./providers/authProvider";
import { dataProvider } from "./providers/dataProvider";
import { i18nProvider } from "./providers/i18nProvider";
import { tema } from "./theme/theme";
import { Layout } from "./layout/Layout";
import { Dashboard } from "./roles/Dashboard";
import { rutasTutor } from "./roles/tutor/rutas";
import { rutasEstancia } from "./roles/estancia/rutas";
import { rutasCoordinador } from "./roles/coordinador/rutas";
import { rutasAdmin } from "./roles/admin/rutas";

/**
 * Punto de entrada de react-admin.
 *
 * Los hijos de <Admin> son una FUNCIÓN que recibe los permisos (el rol
 * que devuelve authProvider.getPermissions). Así cada rol registra solo
 * sus propios recursos y rutas: si un tutor escribe /usuarios en la
 * barra de direcciones, esa ruta simplemente no existe para él.
 */
export const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    i18nProvider={i18nProvider}
    theme={tema}
    layout={Layout}
    dashboard={Dashboard}
    requireAuth
    title="Padrón Infantil"
  >
    {(rol) => {
      switch (rol) {
        case "tutor":
          return rutasTutor;
        case "estancia":
          return rutasEstancia;
        case "coordinador":
          return rutasCoordinador;
        case "admin":
          return rutasAdmin;
        default:
          return null;
      }
    }}
  </Admin>
);
