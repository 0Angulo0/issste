import { CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";
import { EnConstruccion } from "../../components/EnConstruccion";

/**
 * Rutas del rol "tutor" (padre, madre o tutor).
 * Solo lectura: ve únicamente los datos de su hijo o hija.
 * El Inicio (Dashboard) está en ./Dashboard.tsx.
 */
export const rutasTutor = (
  <CustomRoutes>
    <Route path="/graficas" element={<EnConstruccion titulo="Gráficas" />} />
    <Route
      path="/historial"
      element={<EnConstruccion titulo="Historial de mediciones" />}
    />
  </CustomRoutes>
);
