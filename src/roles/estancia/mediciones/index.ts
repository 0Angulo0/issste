import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import { MedicionList } from "./MedicionList";
import { MedicionCreate } from "./MedicionCreate";

//? Vistas del recurso "mediciones" para el personal de estancia.
//? Uso: <Resource name="mediciones" {...mediciones} />
export const mediciones = {
  list: MedicionList,
  create: MedicionCreate,
  icon: MonitorWeightIcon,
};
