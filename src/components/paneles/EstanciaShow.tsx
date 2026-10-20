import {
  DataTable,
  ReferenceManyField,
  Show,
  SimpleShowLayout,
  TextField,
  useRecordContext,
  useTranslate,
} from "react-admin";
import { Box, Card, CardContent, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import EventIcon from "@mui/icons-material/Event";
import { EncabezadoPagina } from "../EncabezadoPagina";
import { TarjetaIndicador } from "../TarjetaIndicador";
import { TablaAlertas } from "./TablaAlertas";
import { useIndicadores } from "../../hooks/useIndicadores";
import {
  calcularEdad,
  formatearFecha,
  periodoActual,
} from "../../utils/fechas";

/**
 * ? Detalle de una estancia ("Ver detalle" en Cumplimiento de captura).
 * Solo lectura, para coordinación y administración: datos de la estancia,
 * alertas del mes y sus niñas y niños (cada uno abre su expediente).
 */
const Detalle = () => {
  const estancia = useRecordContext();
  const translate = useTranslate();
  const { data } = useIndicadores({
    periodo: periodoActual(),
    estanciaId: estancia?.id,
  });
  if (!estancia) return null;
  const resumen = data?.estancias[0];

  return (
    <>
      <EncabezadoPagina
        titulo={estancia.nombre}
        subtitulo={`${estancia.region} · ${estancia.estado} · ${estancia.tipo}`}
      />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2.5 }}>
        <TarjetaIndicador
          icono={<ChildCareIcon />}
          valor={resumen?.infantes ?? "–"}
          texto={translate("panel.atendidos")}
        />
        <TarjetaIndicador
          icono={<WarningAmberIcon />}
          valor={resumen?.alertas ?? "–"}
          texto={translate("panel.con_alerta")}
        />
        <TarjetaIndicador
          icono={<EventIcon />}
          valor={
            resumen?.ultimaCaptura ? formatearFecha(resumen.ultimaCaptura) : "–"
          }
          texto={translate("panel.col_ultima")}
        />
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h2" component="h2">
              {translate("panel.datos_estancia")}
            </Typography>
            <SimpleShowLayout sx={{ p: 0 }}>
              <TextField source="nombre" />
              <TextField source="tipo" />
              <TextField source="estado" />
              <TextField source="region" />
            </SimpleShowLayout>
            <Typography variant="h2" component="h2" sx={{ mt: 2 }}>
              {translate("panel.alertas_titulo")}
            </Typography>
            {data && (
              <TablaAlertas alertas={data.alertas} estancias={data.estancias} />
            )}
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h2" component="h2">
              {translate("panel.infantes_estancia")}
            </Typography>
            <ReferenceManyField
              reference="infantes"
              target="estanciaId"
              sort={{ field: "apellidos", order: "ASC" }}
              perPage={100}
            >
              <DataTable bulkActionButtons={false} rowClick="show">
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
              </DataTable>
            </ReferenceManyField>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export const EstanciaShow = () => (
  <Show component="div" actions={false} title={false}>
    <Detalle />
  </Show>
);
