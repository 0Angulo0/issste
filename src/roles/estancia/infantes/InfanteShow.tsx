import {
  DataTable,
  FunctionField,
  ReferenceField,
  ReferenceManyField,
  Show,
  SimpleShowLayout,
  TextField,
  useRecordContext,
  useTranslate,
  WithRecord,
} from "react-admin";
import { Box, Card, CardContent, Typography } from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { useLocation } from "react-router-dom";
import { EncabezadoPagina } from "../../../components/EncabezadoPagina";
import { AvisoEstado } from "../../../components/AvisoEstado";
import { BotonEnlace } from "../../../components/BotonEnlace";
import { BotonRestablecer } from "../../../components/BotonRestablecer";
import { EstadoNutricional } from "../../../components/EstadoNutricional";
import { BotonCapturar } from "../mediciones/BotonCapturar";
import { useCrecimiento } from "../../../hooks/useCrecimiento";
import { calcularEdad, formatearFecha } from "../../../utils/fechas";

/**
 * ? Expediente de un infante: estado nutricional, datos generales,
 * clave de acceso de la familia e historial de mediciones.
 *
 * Avisos que llegan desde otras pantallas (location.state):
 *   - claveNueva:       recién registrado; muestra la clave para la familia
 *   - medicionGuardada: viene de capturar medidas -> "Medidas guardadas correctamente"
 * Son role="status": el lector de pantalla los anuncia al llegar.
 *
 * soloLectura: el admin y el coordinador lo ven sin botones de captura.
 */
const Expediente = ({ soloLectura }: { soloLectura: boolean }) => {
  const infante = useRecordContext();
  const translate = useTranslate();
  const { state } = useLocation();
  const { ultima } = useCrecimiento(infante?.id);
  if (!infante) return null;

  return (
    <>
      <EncabezadoPagina
        titulo={`${infante.nombre} ${infante.apellidos}`}
        subtitulo={`${calcularEdad(infante.fechaNacimiento)} · ${translate(
          "resources.infantes.fields.expediente",
        )} ${infante.expediente}`}
        acciones={
          <>
            <BotonEnlace
              //^ coordinación y administración usan /curvas (su /graficas es el panel general)
              to={`${soloLectura ? "/curvas" : "/graficas"}?infante=${infante.id}`}
              label="infantes.ver_curvas"
              variant="outlined"
              icono={<ShowChartIcon aria-hidden="true" />}
            />
            {!soloLectura && <BotonCapturar label="mediciones.nueva" />}
          </>
        }
      />

      {state?.claveNueva && (
        <Box sx={{ mb: 2 }}>
          <AvisoEstado tipo="exito">
            {translate("infantes.registrado")}{" "}
            <Box
              component="strong"
              sx={{ fontSize: "1.25rem", letterSpacing: 1 }}
            >
              {state.claveNueva}
            </Box>
            <Typography sx={{ mt: 0.5 }}>
              {translate("infantes.entrega_clave")}
            </Typography>
          </AvisoEstado>
        </Box>
      )}
      {state?.medicionGuardada && (
        <Box sx={{ mb: 2 }}>
          <AvisoEstado tipo="exito">
            {translate("mediciones.guardadas")}
          </AvisoEstado>
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(280px, 1fr) 2fr" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {ultima && (
            <EstadoNutricional
              evaluacion={ultima.evaluacion}
              nombre={infante.nombre}
            />
          )}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h2" component="h2">
                {translate("infantes.datos_generales")}
              </Typography>
              <SimpleShowLayout sx={{ p: 0 }}>
                <FunctionField
                  source="fechaNacimiento"
                  render={(r) => formatearFecha(r.fechaNacimiento)}
                />
                <FunctionField
                  source="sexo"
                  render={(r) => translate(`infantes.sexo.${r.sexo}`)}
                />
                <ReferenceField
                  source="estanciaId"
                  reference="estancias"
                  link={false}
                />
                {!soloLectura && (
                  <ReferenceField
                    source="tutorId"
                    reference="tutores"
                    link={false}
                    label="infantes.tutor"
                  >
                    <TextField source="nombre" />
                  </ReferenceField>
                )}
                {!soloLectura && (
                  <ReferenceField
                    source="tutorId"
                    reference="tutores"
                    link={false}
                    label="infantes.clave_familia"
                  >
                    <TextField source="claveAcceso" sx={{ fontWeight: 700 }} />
                  </ReferenceField>
                )}
              </SimpleShowLayout>
              {!soloLectura && (
                <WithRecord
                  render={(r) => (
                    <BotonRestablecer
                      tipo="tutor"
                      cuentaId={r.tutorId}
                      nombre={`${r.nombre} ${r.apellidos}`}
                      etiqueta="restablecer.boton_familia"
                    />
                  )}
                />
              )}
            </CardContent>
          </Card>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h2" component="h2">
              {translate("mediciones.historial")}
            </Typography>
            <ReferenceManyField
              reference="mediciones"
              target="infanteId"
              sort={{ field: "fecha", order: "DESC" }}
            >
              <DataTable
                bulkActionButtons={false}
                rowClick={false}
                empty={
                  <Typography>
                    {translate("mediciones.sin_mediciones")}
                  </Typography>
                }
              >
                <DataTable.Col
                  source="fecha"
                  render={(r) => formatearFecha(r.fecha)}
                />
                <DataTable.NumberCol source="peso" />
                <DataTable.NumberCol source="talla" />
                <DataTable.NumberCol source="perimetroCefalico" />
              </DataTable>
            </ReferenceManyField>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export const InfanteShow = ({
  soloLectura = false,
}: {
  soloLectura?: boolean;
}) => (
  <Show component="div" actions={false} title={false}>
    <Expediente soloLectura={soloLectura} />
  </Show>
);
