import { CustomRoutes, Resource } from "react-admin";
import { Route } from "react-router-dom";
import { EnConstruccion } from "../../components/EnConstruccion";

/**
 * Rutas del rol "coordinador" (coordinación regional).
 * Solo lectura sobre las estancias de SU región.
 */
export const rutasCoordinador = (
  <>
    {/* Sin vistas propias: se registra para poder consultar estancias
        (por ejemplo con ReferenceField) desde las pantallas del rol. */}
    <Resource name="estancias" recordRepresentation="nombre" />
    <CustomRoutes>
      <Route path="/graficas" element={<EnConstruccion titulo="Gráficas" />} />
      <Route
        path="/cumplimiento"
        element={<EnConstruccion titulo="Cumplimiento de captura" />}
      />
      <Route
        path="/reportes"
        element={<EnConstruccion titulo="Reportes regionales" />}
      />
    </CustomRoutes>
  </>
);
