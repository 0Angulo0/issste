import {
  DataTable,
  List,
  SelectInput,
  TextInput,
  useTranslate,
} from "react-admin";
import { EncabezadoPagina } from "../../components/EncabezadoPagina";

/**
 * ? Bitácora de auditoría (solo lectura): inicios de sesión y todos los
 * cambios, con quién, cuándo y sobre qué registro. La escribe solo el
 * servidor (server/bitacora.js); nadie puede editarla desde la API.
 */
const ACCIONES = [
  "login",
  "login_fallido",
  "primer_acceso",
  "crear",
  "editar",
  "corregir",
  "dar_de_baja",
  "restablecer",
];

const filtros = [
  <TextInput key="q" source="q" label="infantes.buscar" alwaysOn />,
  <SelectInput
    key="accion"
    source="accion"
    label="bitacora.filtrar_accion"
    choices={ACCIONES.map((a) => ({ id: a, name: `bitacora.acciones.${a}` }))}
    alwaysOn
  />,
];

/** "2026-10-19T18:05:00.000Z" -> "19/10/2026 12:05" (hora local) */
const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  });

export const BitacoraList = () => {
  const translate = useTranslate();
  return (
    <>
      <EncabezadoPagina
        titulo={translate("bitacora.titulo")}
        subtitulo={translate("bitacora.descripcion")}
      />
      <List
        filters={filtros}
        sort={{ field: "id", order: "DESC" }}
        actions={false}
        title={false}
        perPage={25}
      >
        <DataTable bulkActionButtons={false} rowClick={false}>
          <DataTable.Col source="fecha" render={(r) => fechaHora(r.fecha)} />
          <DataTable.Col source="nombre" />
          <DataTable.Col
            source="rol"
            render={(r) => (r.rol ? translate(`roles.${r.rol}`) : "")}
          />
          <DataTable.Col
            source="accion"
            render={(r) => translate(`bitacora.acciones.${r.accion}`)}
          />
          <DataTable.Col source="recurso" />
          <DataTable.Col source="registroId" />
          <DataTable.Col source="detalle" />
        </DataTable>
      </List>
    </>
  );
};
