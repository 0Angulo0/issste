import { CustomRoutes, Resource } from "react-admin";
import { Route } from "react-router-dom";
import { infantes } from "./infantes";
import { mediciones } from "./mediciones";
import { PanelCurvas } from "../../components/graficas/PanelCurvas";

/**
 * Rutas del rol "estancia" (personal de la EBDI).
 * Pantalla 2: registrar infantes y capturar medidas.
 * Pantalla 3: curvas de crecimiento.
 */
export const rutasEstancia = (
  <>
    <Resource name="infantes" {...infantes} />
    <Resource name="mediciones" {...mediciones} />
    {/* Sin vistas propias: se registran para mostrar la estancia y la
        clave de acceso de la familia en el expediente (ReferenceField). */}
    <Resource name="estancias" recordRepresentation="nombre" />
    <Resource name="tutores" recordRepresentation="nombre" />
    <CustomRoutes>
      <Route
        path="/graficas"
        element={<PanelCurvas titulo="graficas.titulo_estancia" />}
      />
    </CustomRoutes>
  </>
);
