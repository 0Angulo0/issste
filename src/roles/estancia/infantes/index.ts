import ChildCareIcon from "@mui/icons-material/ChildCare";
import { InfanteList } from "./InfanteList";
import { InfanteShow } from "./InfanteShow";
import { InfanteCreate } from "./InfanteCreate";

//? Vistas del recurso "infantes" para el personal de estancia.
//? Uso: <Resource name="infantes" {...infantes} />
export const infantes = {
  list: InfanteList,
  show: InfanteShow,
  create: InfanteCreate,
  icon: ChildCareIcon,
  recordRepresentation: (r: { nombre: string; apellidos: string }) =>
    `${r.nombre} ${r.apellidos}`,
};
