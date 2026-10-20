import {
  AutocompleteInput,
  DataTable,
  DateInput,
  List,
  ReferenceField,
  ReferenceInput,
  useTranslate,
  WithRecord,
} from "react-admin";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { EncabezadoPagina } from "../../../components/EncabezadoPagina";
import { BotonEnlace } from "../../../components/BotonEnlace";
import { formatearFecha } from "../../../utils/fechas";

/**
 * ? Correcciones de registro: todas las mediciones, con filtros por infante
 * y fechas. "Corregir" abre el formulario que exige un motivo, que queda
 * en la bitácora.
 */
const filtros = [
  <ReferenceInput
    key="infanteId"
    source="infanteId"
    reference="infantes"
    alwaysOn
  >
    <AutocompleteInput label="mediciones.filtrar_infante" />
  </ReferenceInput>,
  <DateInput
    key="desde"
    source="fecha_gte"
    label="correcciones.desde"
    alwaysOn
  />,
  <DateInput
    key="hasta"
    source="fecha_lte"
    label="correcciones.hasta"
    alwaysOn
  />,
];

export const CorreccionList = () => {
  const translate = useTranslate();
  return (
    <>
      <EncabezadoPagina
        titulo={translate("correcciones.titulo")}
        subtitulo={translate("correcciones.aviso")}
      />
      <List
        filters={filtros}
        sort={{ field: "fecha", order: "DESC" }}
        actions={false}
        title={false}
      >
        <DataTable bulkActionButtons={false} rowClick={false}>
          <DataTable.Col
            source="fecha"
            render={(r) => formatearFecha(r.fecha)}
          />
          <DataTable.Col source="infanteId">
            <ReferenceField
              source="infanteId"
              reference="infantes"
              link="show"
            />
          </DataTable.Col>
          <DataTable.NumberCol source="peso" />
          <DataTable.NumberCol source="talla" />
          <DataTable.NumberCol source="perimetroCefalico" />
          <DataTable.Col source="registradoPor">
            <ReferenceField
              source="registradoPor"
              reference="usuarios"
              link={false}
            />
          </DataTable.Col>
          <DataTable.Col label="usuarios.acciones">
            <WithRecord
              render={(m) => (
                <BotonEnlace
                  to={`/mediciones/${m.id}`}
                  label="correcciones.corregir"
                  variant="outlined"
                  icono={<EditNoteIcon aria-hidden="true" />}
                />
              )}
            />
          </DataTable.Col>
        </DataTable>
      </List>
    </>
  );
};
