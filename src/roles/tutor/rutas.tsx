import { CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";
import { PanelCurvas } from "../../components/graficas/PanelCurvas";
import { HistorialTutor } from "./Historial";

/**
 * Rutas del rol "tutor" (padre, madre o tutor) · Pantalla 4.
 * Solo lectura: el servidor solo le entrega los datos de sus hijos.
 * El Inicio (Dashboard) está en ./Dashboard.tsx.
 */
export const rutasTutor = (
  <CustomRoutes>
    <Route
      path="/graficas"
      element={<PanelCurvas titulo="graficas.titulo_familia" modoFamilia />}
    />
    <Route path="/historial" element={<HistorialTutor />} />
  </CustomRoutes>
);
