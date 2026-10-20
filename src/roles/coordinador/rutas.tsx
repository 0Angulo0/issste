import { CustomRoutes, Resource } from "react-admin";
import { Route } from "react-router-dom";
import { leerSesion } from "../../providers/authProvider";
import { EstanciaShow } from "../../components/paneles/EstanciaShow";
import { GraficasAgregadas } from "../../components/paneles/GraficasAgregadas";
import { Cumplimiento } from "../../components/paneles/Cumplimiento";
import { Reportes } from "../../components/paneles/Reportes";
import { PanelCurvas } from "../../components/graficas/PanelCurvas";
import { InfanteShow } from "../estancia/infantes/InfanteShow";

/**
 * Rutas del rol "coordinador" (coordinación regional) · Pantalla 5.
 * Solo lectura sobre las estancias de SU región (el servidor lo garantiza).
 */
const region = () => leerSesion()?.region;

const InfanteSoloLectura = () => <InfanteShow soloLectura />;

export const rutasCoordinador = (
  <>
    <Resource
      name="estancias"
      show={EstanciaShow}
      recordRepresentation="nombre"
    />
    <Resource
      name="infantes"
      show={InfanteSoloLectura}
      recordRepresentation={(r) => `${r.nombre} ${r.apellidos}`}
    />
    <CustomRoutes>
      <Route
        path="/graficas"
        element={
          <GraficasAgregadas
            campos={["estancia", "periodo"]}
            regionFija={region()}
          />
        }
      />
      <Route
        path="/cumplimiento"
        element={<Cumplimiento campos={["periodo"]} regionFija={region()} />}
      />
      <Route
        path="/reportes"
        element={
          <Reportes
            titulo="reportes.titulo_regional"
            campos={["estancia", "periodo"]}
            regionFija={region()}
          />
        }
      />
      <Route
        path="/curvas"
        element={<PanelCurvas titulo="graficas.titulo_estancia" />}
      />
    </CustomRoutes>
  </>
);
