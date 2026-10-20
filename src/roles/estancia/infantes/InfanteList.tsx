import {
  DataTable,
  List,
  TextInput,
  useRecordContext,
  useTranslate,
} from "react-admin";
import { Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { EncabezadoPagina } from "../../../components/EncabezadoPagina";
import { BotonEnlace } from "../../../components/BotonEnlace";
import { BotonCapturar } from "../mediciones/BotonCapturar";
import { calcularEdad } from "../../../utils/fechas";

/**
 * ? Lista de infantes de la estancia.
 *
 * El servidor solo regresa los infantes de la estancia del usuario
 * (server/permisos.js), así que aquí no hace falta filtrar.
 * Cada fila tiene botones con texto ("Ver expediente", "Capturar medidas")
 * para poder elegir a un infante solo con teclado.
 */
const filtros = [
  <TextInput
    key="q"
    source="q"
    label="infantes.buscar"
    helperText="infantes.buscar_ayuda"
    alwaysOn
  />,
];

/** "Ver expediente" con texto visible (ShowButton lo oculta en celular). */
const BotonVer = () => {
  const infante = useRecordContext();
  return infante ? (
    <BotonEnlace
      to={`/infantes/${infante.id}/show`}
      label="infantes.ver"
      variant="outlined"
      icono={<VisibilityIcon aria-hidden="true" />}
      detenerPropagacion
    />
  ) : null;
};

export const InfanteList = () => {
  const translate = useTranslate();
  return (
    <>
      <EncabezadoPagina
        titulo={translate("resources.infantes.name", { smart_count: 2 })}
        acciones={
          <BotonEnlace
            to="/infantes/create"
            label="infantes.registrar"
            icono={<AddIcon aria-hidden="true" />}
          />
        }
      />
      <List
        filters={filtros}
        sort={{ field: "apellidos", order: "ASC" }}
        actions={false}
        title={false}
      >
        <DataTable rowClick="show" bulkActionButtons={false}>
          <DataTable.Col
            source="apellidos"
            label="infantes.nombre_completo"
            render={(r) => `${r.nombre} ${r.apellidos}`}
          />
          <DataTable.Col source="expediente" />
          <DataTable.Col
            label="infantes.edad"
            render={(r) => calcularEdad(r.fechaNacimiento)}
          />
          <DataTable.Col label="infantes.acciones">
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <BotonVer />
              <BotonCapturar label="mediciones.capturar" variant="outlined" />
            </Box>
          </DataTable.Col>
        </DataTable>
      </List>
    </>
  );
};
