import { DataTable, List, useTranslate, WithRecord } from "react-admin";
import { EncabezadoPagina } from "../../components/EncabezadoPagina";
import { BotonEnlace } from "../../components/BotonEnlace";

/**
 * ? Estancias (EBDI) registradas. "Ver detalle" abre sus indicadores y
 * sus niñas y niños.
 */
export const EstanciaList = () => {
  const translate = useTranslate();
  return (
    <>
      <EncabezadoPagina
        titulo={translate("resources.estancias.name", { smart_count: 2 })}
      />
      <List
        sort={{ field: "nombre", order: "ASC" }}
        actions={false}
        title={false}
      >
        <DataTable bulkActionButtons={false} rowClick="show">
          <DataTable.Col source="nombre" />
          <DataTable.Col source="tipo" />
          <DataTable.Col source="estado" />
          <DataTable.Col source="region" />
          <DataTable.Col label="panel.col_accion">
            <WithRecord
              render={(e) => (
                <BotonEnlace
                  to={`/estancias/${e.id}/show`}
                  label="panel.ver_detalle"
                  variant="outlined"
                  detenerPropagacion
                />
              )}
            />
          </DataTable.Col>
        </DataTable>
      </List>
    </>
  );
};
