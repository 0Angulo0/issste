import { CustomRoutes, ListGuesser, Resource } from "react-admin";
import { Route } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { EnConstruccion } from "../../components/EnConstruccion";

/**
 * Rutas del rol "admin" (oficinas centrales).
 * Gestión de usuarios, corrección de registros y reportes generales.
 *
 * ListGuesser es temporal: se reemplaza en la Pantalla 6.
 */
export const rutasAdmin = (
  <>
    <Resource
      name="usuarios"
      list={ListGuesser}
      icon={GroupIcon}
      recordRepresentation="nombre"
    />
    <Resource name="mediciones" list={ListGuesser} icon={EditNoteIcon} />
    <Resource
      name="infantes"
      list={ListGuesser}
      icon={ChildCareIcon}
      recordRepresentation={(r) => `${r.nombre} ${r.apellidos}`}
    />
    <Resource
      name="estancias"
      list={ListGuesser}
      icon={HomeWorkIcon}
      recordRepresentation="nombre"
    />
    <CustomRoutes>
      <Route path="/graficas" element={<EnConstruccion titulo="Gráficas" />} />
      <Route path="/reportes" element={<EnConstruccion titulo="Reportes" />} />
    </CustomRoutes>
  </>
);
