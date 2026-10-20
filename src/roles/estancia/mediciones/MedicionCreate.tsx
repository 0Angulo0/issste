import {
  AutocompleteInput,
  Create,
  DateInput,
  NumberInput,
  ReferenceInput,
  SimpleForm,
  required,
  useGetOne,
  useRecordFromLocation,
  useTranslate,
} from "react-admin";
import { Box, Card, CardContent, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";
import { EncabezadoPagina } from "../../../components/EncabezadoPagina";
import { BarraGuardarCancelar } from "../../../components/BarraGuardarCancelar";
import { enRango, noFutura, despuesDe } from "../../../utils/validaciones";
import { calcularEdad, hoy } from "../../../utils/fechas";
import { colores } from "../../../theme/theme";

/**
 * ? Pantalla 2: captura de medidas (personal de estancia).
 *
 * Se llega desde "Capturar medidas" / "Nueva medición" con el infante ya
 * elegido (?source={"infanteId":1} en la URL), o desde el menú
 * "Mediciones", y entonces se elige al infante en el formulario.
 *
 * Accesibilidad (borrador + Evidencia 1.1):
 *   - Cada campo con etiqueta visible y texto de ayuda debajo.
 *   - Rangos revisados al guardar, con mensaje que dice qué esperar.
 *   - Botón "Guardar" visible (Yollot no tenía) y aviso
 *     "Medidas guardadas correctamente" al terminar (role="status").
 */

/** Recordatorios de la tarjeta "Antes de guardar" (del borrador). */
const RECORDATORIOS = [
  "mediciones.recordatorios.fecha",
  "mediciones.recordatorios.ropa",
  "mediciones.recordatorios.decimal",
];

export const MedicionCreate = () => {
  const translate = useTranslate();
  const navigate = useNavigate();
  //^ mismo lugar de donde react-admin toma los valores iniciales
  const infanteId = useRecordFromLocation()?.infanteId;
  const { data: infante } = useGetOne(
    "infantes",
    { id: infanteId },
    { enabled: !!infanteId },
  );

  return (
    <>
      <EncabezadoPagina
        titulo={
          infante
            ? `${infante.nombre} ${infante.apellidos}`
            : translate("mediciones.capturar")
        }
        subtitulo={
          infante &&
          `${calcularEdad(infante.fechaNacimiento)} · ${translate(
            "resources.infantes.fields.expediente",
          )} ${infante.expediente}`
        }
      />
      <Create
        title={false}
        component="div"
        //? En lugar del aviso pequeño de react-admin, volvemos al expediente
        //? y ahí se muestra "Medidas guardadas correctamente".
        mutationOptions={{
          onSuccess: (medicion) =>
            navigate(`/infantes/${medicion.infanteId}/show`, {
              state: { medicionGuardada: true },
            }),
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 720px) 420px" },
            gap: 2.5,
            alignItems: "start",
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h2" component="h2">
                {translate("mediciones.capturar")}
              </Typography>
              <SimpleForm
                defaultValues={{ fecha: hoy() }}
                toolbar={<BarraGuardarCancelar />}
                sx={{ p: 0 }}
              >
                {!infanteId && (
                  <ReferenceInput source="infanteId" reference="infantes">
                    <AutocompleteInput
                      validate={required()}
                      helperText="mediciones.infante_ayuda"
                      fullWidth
                    />
                  </ReferenceInput>
                )}
                <DateInput
                  source="fecha"
                  validate={[
                    required(),
                    noFutura,
                    despuesDe(infante?.fechaNacimiento),
                  ]}
                  helperText="mediciones.ayuda.fecha"
                  fullWidth
                />
                <NumberInput
                  source="peso"
                  step={0.1}
                  validate={[required(), enRango("peso")]}
                  helperText="mediciones.ayuda.peso"
                  fullWidth
                />
                <NumberInput
                  source="talla"
                  step={0.1}
                  validate={[required(), enRango("talla")]}
                  helperText="mediciones.ayuda.talla"
                  fullWidth
                />
                <NumberInput
                  source="perimetroCefalico"
                  step={0.1}
                  validate={[required(), enRango("perimetroCefalico")]}
                  helperText="mediciones.ayuda.perimetro"
                  fullWidth
                />
              </SimpleForm>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h2" component="h2">
                {translate("mediciones.antes_de_guardar")}
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                {RECORDATORIOS.map((llave) => (
                  <Box
                    component="li"
                    key={llave}
                    sx={{ display: "flex", gap: 1.25, mb: 1.5 }}
                  >
                    <CheckCircleOutlineIcon
                      aria-hidden="true"
                      sx={{ color: colores.verde }}
                    />
                    {translate(llave)}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Create>
    </>
  );
};
