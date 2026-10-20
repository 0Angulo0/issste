import {
  DateInput,
  Edit,
  NumberInput,
  SimpleForm,
  TextInput,
  required,
  useGetOne,
  useNotify,
  useRecordContext,
  useRedirect,
  useTranslate,
} from "react-admin";
import { Box } from "@mui/material";
import { EncabezadoPagina } from "../../../components/EncabezadoPagina";
import { AvisoEstado } from "../../../components/AvisoEstado";
import { BarraGuardarCancelar } from "../../../components/BarraGuardarCancelar";
import { enRango, noFutura, despuesDe } from "../../../utils/validaciones";

/**
 * ? Corregir una medición (solo administración).
 *
 * - El motivo es obligatorio: el servidor lo guarda en la bitácora junto
 *   con quién corrigió y cuándo (no se guarda en la medición).
 * - Mismas validaciones que la captura (rangos y fechas).
 * - Guardado "pesimista": el aviso aparece hasta que el servidor confirma.
 */
const Formulario = () => {
  const medicion = useRecordContext();
  const translate = useTranslate();
  const { data: infante } = useGetOne(
    "infantes",
    { id: medicion?.infanteId },
    { enabled: !!medicion },
  );
  const nombre = infante ? `${infante.nombre} ${infante.apellidos}` : "";

  return (
    <>
      <EncabezadoPagina
        titulo={translate("correcciones.corregir_de", { nombre })}
      />
      <SimpleForm
        toolbar={<BarraGuardarCancelar />}
        sx={{ backgroundColor: "#fff", borderRadius: 2, maxWidth: 760 }}
      >
        <Box sx={{ mb: 2, width: "100%" }}>
          <AvisoEstado tipo="info">
            {translate("correcciones.aviso")}
          </AvisoEstado>
        </Box>
        <DateInput
          source="fecha"
          validate={[required(), noFutura, despuesDe(infante?.fechaNacimiento)]}
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
          fullWidth
        />
        <NumberInput
          source="perimetroCefalico"
          step={0.1}
          validate={[required(), enRango("perimetroCefalico")]}
          fullWidth
        />
        <TextInput
          source="motivo"
          label="correcciones.motivo"
          helperText="correcciones.motivo_ayuda"
          validate={required()}
          multiline
          minRows={2}
          fullWidth
        />
      </SimpleForm>
    </>
  );
};

export const CorreccionEdit = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  return (
    <Edit
      title={false}
      actions={false}
      component="div"
      mutationMode="pessimistic"
      mutationOptions={{
        onSuccess: () => {
          notify("correcciones.guardada", { type: "success" });
          redirect("list", "mediciones");
        },
      }}
    >
      <Formulario />
    </Edit>
  );
};
