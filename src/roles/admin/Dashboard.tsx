import { PanelIndicadores } from "../../components/paneles/PanelIndicadores";

/**
 * ? Pantalla 6: "Panel general" del administrador.
 * Filtros por estado, región, estancia y periodo; totales nacionales,
 * cumplimiento de captura y niñas y niños por región.
 */
export const DashboardAdmin = () => (
  <PanelIndicadores
    titulo="panel.panel_general"
    campos={["entidad", "region", "estancia", "periodo"]}
    textoDescarga="panel.descargar"
    textoTotal="panel.registrados"
    porRegion
  />
);
