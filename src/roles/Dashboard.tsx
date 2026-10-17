import { usePermissions } from "react-admin";
import { DashboardTutor } from "./tutor/Dashboard";
import { DashboardEstancia } from "./estancia/Dashboard";
import { DashboardCoordinador } from "./coordinador/Dashboard";
import { DashboardAdmin } from "./admin/Dashboard";

/**
 * react-admin solo admite UN dashboard (la pantalla "Inicio").
 * Este componente elige cuál mostrar según el rol de la sesión.
 */
export const Dashboard = () => {
  const { permissions: rol, isPending } = usePermissions();
  if (isPending) return null;

  switch (rol) {
    case "tutor":
      return <DashboardTutor />;
    case "estancia":
      return <DashboardEstancia />;
    case "coordinador":
      return <DashboardCoordinador />;
    case "admin":
      return <DashboardAdmin />;
    default:
      return null;
  }
};
