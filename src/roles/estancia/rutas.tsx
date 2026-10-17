import { CustomRoutes, ListGuesser, Resource } from "react-admin";
import { Route } from "react-router-dom";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import { EnConstruccion } from "../../components/EnConstruccion";

/**
 * Rutas del rol "estancia" (personal de la EBDI).
 * Registra infantes y captura sus medidas.
 *
 * ListGuesser es temporal: se reemplaza por las vistas reales en las
 * Pantallas 2 y 3.
 */
export const rutasEstancia = (
  <>
    <Resource
      name="infantes"
      list={ListGuesser}
      icon={ChildCareIcon}
      recordRepresentation={(r) => `${r.nombre} ${r.apellidos}`}
    />
    <Resource name="mediciones" list={ListGuesser} icon={MonitorWeightIcon} />
    <CustomRoutes>
      <Route
        path="/graficas"
        element={<EnConstruccion titulo="Curvas de crecimiento" />}
      />
    </CustomRoutes>
  </>
);
