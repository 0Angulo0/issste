import {
  Create,
  DateInput,
  RadioButtonGroupInput,
  SimpleForm,
  TextInput,
  required,
  useTranslate,
} from "react-admin";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { EncabezadoPagina } from "../../../components/EncabezadoPagina";
import { AvisoEstado } from "../../../components/AvisoEstado";
import { BarraGuardarCancelar } from "../../../components/BarraGuardarCancelar";
import { hoy } from "../../../utils/fechas";

/**
 * ? Alta de un infante en la estancia.
 *
 * Al guardar, el servidor (POST /infantes en server/server.js):
 *   - lo inscribe en la estancia del usuario,
 *   - le asigna un número de expediente,
 *   - crea la cuenta del tutor con una CLAVE DE ACCESO nueva.
 * Después se abre el expediente mostrando la clave para entregarla a la familia.
 */

//? No se aceptan fechas futuras (error de captura común)
const noFutura = (valor: string) =>
  valor && valor > hoy() ? "infantes.errores.nacimiento_futuro" : undefined;

export const InfanteCreate = () => {
  const translate = useTranslate();
  const navigate = useNavigate();

  return (
    <>
      <EncabezadoPagina titulo={translate("infantes.registrar")} />
      <Create
        title={false}
        //? En lugar del aviso pequeño de react-admin, abrimos el expediente
        //? con la clave de acceso a la vista (ver InfanteShow).
        mutationOptions={{
          onSuccess: (infante) =>
            navigate(`/infantes/${infante.id}/show`, {
              state: { claveNueva: infante.claveAcceso },
            }),
        }}
        sx={{ maxWidth: 760 }}
      >
        <SimpleForm toolbar={<BarraGuardarCancelar />}>
          <Box sx={{ mb: 2, width: "100%" }}>
            <AvisoEstado tipo="info">
              {translate("infantes.aviso_clave")}
            </AvisoEstado>
          </Box>

          <Typography variant="h2" component="h2">
            {translate("infantes.seccion_infante")}
          </Typography>
          <TextInput source="nombre" validate={required()} fullWidth />
          <TextInput source="apellidos" validate={required()} fullWidth />
          <DateInput
            source="fechaNacimiento"
            validate={[required(), noFutura]}
            helperText="infantes.fecha_ayuda"
          />
          {/* fieldset + legend: el lector sabe a qué pregunta pertenece
              cada opción (en la calculadora del CDC no estaban agrupadas) */}
          <RadioButtonGroupInput
            source="sexo"
            validate={required()}
            choices={[
              { id: "F", name: "infantes.sexo.F" },
              { id: "M", name: "infantes.sexo.M" },
            ]}
          />

          <Typography variant="h2" component="h2" sx={{ mt: 2 }}>
            {translate("infantes.seccion_tutor")}
          </Typography>
          <TextInput source="tutorNombre" validate={required()} fullWidth />
          <TextInput
            source="tutorCiudad"
            validate={required()}
            helperText="infantes.ciudad_ayuda"
            fullWidth
          />
        </SimpleForm>
      </Create>
    </>
  );
};
