import { CustomRoutes, Resource } from "react-admin";
import { Route } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { UsuarioList } from "./usuarios/UsuarioList";
import { UsuarioCreate } from "./usuarios/UsuarioCreate";
import { UsuarioEdit } from "./usuarios/UsuarioEdit";
import { CorreccionList } from "./correcciones/CorreccionList";
import { CorreccionEdit } from "./correcciones/CorreccionEdit";
import { InfanteListAdmin } from "./InfanteListAdmin";
import { EstanciaList } from "./EstanciaList";
import { BitacoraList } from "./BitacoraList";
import { InfanteShow } from "../estancia/infantes/InfanteShow";
import { EstanciaShow } from "../../components/paneles/EstanciaShow";
import { GraficasAgregadas } from "../../components/paneles/GraficasAgregadas";
import { Reportes } from "../../components/paneles/Reportes";
import { PanelCurvas } from "../../components/graficas/PanelCurvas";

/**
 * Rutas del rol "admin" (oficinas centrales) · Pantalla 6.
 * Gestión de usuarios, corrección de registros, bitácora y reportes.
 */
const InfanteSoloLectura = () => <InfanteShow soloLectura />;
const CAMPOS = ["entidad", "region", "estancia", "periodo"] as const;

export const rutasAdmin = (
  <>
    <Resource
      name="usuarios"
      list={UsuarioList}
      create={UsuarioCreate}
      edit={UsuarioEdit}
      icon={GroupIcon}
      recordRepresentation="nombre"
    />
    <Resource
      name="mediciones"
      list={CorreccionList}
      edit={CorreccionEdit}
      icon={EditNoteIcon}
    />
    <Resource
      name="infantes"
      list={InfanteListAdmin}
      show={InfanteSoloLectura}
      icon={ChildCareIcon}
      recordRepresentation={(r) => `${r.nombre} ${r.apellidos}`}
    />
    <Resource
      name="estancias"
      list={EstanciaList}
      show={EstanciaShow}
      icon={HomeWorkIcon}
      recordRepresentation="nombre"
    />
    <Resource name="bitacora" list={BitacoraList} icon={ReceiptLongIcon} />
    <CustomRoutes>
      <Route
        path="/graficas"
        element={<GraficasAgregadas campos={[...CAMPOS]} agruparPorRegion />}
      />
      <Route
        path="/reportes"
        element={<Reportes titulo="reportes.titulo" campos={[...CAMPOS]} />}
      />
      <Route
        path="/curvas"
        element={<PanelCurvas titulo="graficas.titulo_estancia" />}
      />
    </CustomRoutes>
  </>
);
