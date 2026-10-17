import { Menu as RaMenu, usePermissions, useTranslate } from "react-admin";
import BarChartIcon from "@mui/icons-material/BarChart";
import HistoryIcon from "@mui/icons-material/History";
import DescriptionIcon from "@mui/icons-material/Description";
import FactCheckIcon from "@mui/icons-material/FactCheck";

/**
 * Menú lateral: cada rol ve SOLO sus opciones.
 * Todas las opciones tienen icono + texto (nunca solo icono).
 *
 * - Menu.DashboardItem   -> "Inicio" (el Dashboard cambia según el rol)
 * - Menu.ResourceItem    -> un <Resource> registrado en roles/<rol>/rutas.tsx
 * - Menu.Item            -> una ruta propia (<CustomRoutes>)
 */
export const Menu = () => {
  const { permissions: rol } = usePermissions();
  const translate = useTranslate();

  // "Inicio" es el Dashboard de react-admin (cambia según el rol).
  const inicio = (
    <RaMenu.DashboardItem primaryText={translate("menu.inicio")} />
  );
  const graficas = (
    <RaMenu.Item
      to="/graficas"
      primaryText={translate("menu.graficas")}
      leftIcon={<BarChartIcon />}
    />
  );
  const reportes = (
    <RaMenu.Item
      to="/reportes"
      primaryText={translate("menu.reportes")}
      leftIcon={<DescriptionIcon />}
    />
  );

  switch (rol) {
    case "tutor":
      return (
        <RaMenu>
          {inicio}
          {graficas}
          <RaMenu.Item
            to="/historial"
            primaryText={translate("menu.historial")}
            leftIcon={<HistoryIcon />}
          />
        </RaMenu>
      );
    case "estancia":
      return (
        <RaMenu>
          {inicio}
          <RaMenu.ResourceItem name="infantes" />
          <RaMenu.ResourceItem name="mediciones" />
          {graficas}
        </RaMenu>
      );
    case "coordinador":
      return (
        <RaMenu>
          {inicio}
          {graficas}
          <RaMenu.Item
            to="/cumplimiento"
            primaryText={translate("menu.cumplimiento")}
            leftIcon={<FactCheckIcon />}
          />
          {reportes}
        </RaMenu>
      );
    case "admin":
      return (
        <RaMenu>
          {inicio}
          {graficas}
          <RaMenu.ResourceItem name="usuarios" />
          {/* Para el admin, "mediciones" es la sección de correcciones */}
          <RaMenu.ResourceItem
            name="mediciones"
            primaryText={translate("menu.correcciones")}
          />
          <RaMenu.ResourceItem name="infantes" />
          <RaMenu.ResourceItem name="estancias" />
          {reportes}
        </RaMenu>
      );
    default:
      return <RaMenu />;
  }
};
