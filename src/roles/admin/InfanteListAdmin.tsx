import {
  DataTable,
  List,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  TextInput,
  useTranslate,
} from "react-admin";
import { EncabezadoPagina } from "../../components/EncabezadoPagina";
import { calcularEdad } from "../../utils/fechas";

/**
 * ? Todas las niñas y niños registrados (solo lectura para administración).
 * Al elegir una fila se abre su expediente. El alta la hace cada estancia.
 */
const filtros = [
  <TextInput
    key="q"
    source="q"
    label="infantes.buscar"
    helperText="infantes.buscar_ayuda"
    alwaysOn
  />,
  <ReferenceInput
    key="estanciaId"
    source="estanciaId"
    reference="estancias"
    alwaysOn
  >
    <SelectInput optionText="nombre" label="infantes.filtrar_estancia" />
  </ReferenceInput>,
];

export const InfanteListAdmin = () => {
  const translate = useTranslate();
  return (
    <>
      <EncabezadoPagina
        titulo={translate("resources.infantes.name", { smart_count: 2 })}
      />
      <List
        filters={filtros}
        sort={{ field: "apellidos", order: "ASC" }}
        actions={false}
        title={false}
      >
        {/* rowClick: además, el nombre de cada fila se abre con Tab + Enter */}
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
          <DataTable.Col source="estanciaId">
            <ReferenceField
              source="estanciaId"
              reference="estancias"
              link="show"
            />
          </DataTable.Col>
        </DataTable>
      </List>
    </>
  );
};
