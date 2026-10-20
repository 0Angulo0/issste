import { PanelIndicadores } from "../../components/paneles/PanelIndicadores";
import { leerSesion } from "../../providers/authProvider";

/**
 * ? Pantalla 5: "Indicadores de la región" del coordinador.
 * La región es fija (la de su cuenta): el servidor solo le entrega datos
 * de sus estancias, así que puede filtrar por estancia y periodo.
 */
export const DashboardCoordinador = () => (
  <PanelIndicadores
    titulo="panel.indicadores_region"
    campos={["estancia", "periodo"]}
    regionFija={leerSesion()?.region}
    textoDescarga="panel.descargar_regional"
    textoTotal="panel.atendidos"
  />
);
