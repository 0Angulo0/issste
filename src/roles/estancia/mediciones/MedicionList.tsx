import {
  AutocompleteInput,
  DataTable,
  List,
  ReferenceField,
  ReferenceInput,
  useTranslate,
} from "react-admin";
import AddIcon from "@mui/icons-material/Add";
import { EncabezadoPagina } from "../../../components/EncabezadoPagina";
import { BotonEnlace } from "../../../components/BotonEnlace";
import { formatearFecha } from "../../../utils/fechas";

/**
 * ? Todas las mediciones de la estancia, de la más reciente a la más antigua.
 * Se puede filtrar por infante. El servidor solo regresa las de la estancia.
 * Corregir una medición es tarea del administrador, por eso aquí no se edita.
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
];

export const MedicionList = () => {
  const translate = useTranslate();
  return (
    <>
      <EncabezadoPagina
        titulo={translate("resources.mediciones.name", { smart_count: 2 })}
        acciones={
          <BotonEnlace
            to="/mediciones/create"
            label="mediciones.nueva"
            icono={<AddIcon aria-hidden="true" />}
          />
        }
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
            {/* enlace al expediente: se puede abrir con teclado (Tab + Enter) */}
            <ReferenceField
              source="infanteId"
              reference="infantes"
              link="show"
            />
          </DataTable.Col>
          <DataTable.NumberCol source="peso" />
          <DataTable.NumberCol source="talla" />
          <DataTable.NumberCol source="perimetroCefalico" />
        </DataTable>
      </List>
    </>
  );
};
