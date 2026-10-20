import { useRecordContext } from "react-admin";
import AddIcon from "@mui/icons-material/Add";
import { BotonEnlace } from "../../../components/BotonEnlace";

/**
 * ? Botón "Capturar medidas" / "Nueva medición" de un infante.
 *
 * Abre /mediciones/create?source={"infanteId":1} con el infante ya elegido:
 * react-admin usa "source" de la URL como valores iniciales del formulario.
 * Es un botón con texto visible y se puede usar con teclado (en Yollot
 * no se podía elegir un paciente con Tab, hallazgo de la Evidencia 1.1).
 */
export const BotonCapturar = ({
  label = "mediciones.nueva",
  variant = "contained",
}: {
  label?: string;
  variant?: "contained" | "outlined" | "text";
}) => {
  const infante = useRecordContext();
  if (!infante) return null;
  return (
    <BotonEnlace
      to={`/mediciones/create?source=${encodeURIComponent(
        JSON.stringify({ infanteId: infante.id }),
      )}`}
      label={label}
      variant={variant}
      icono={<AddIcon aria-hidden="true" />}
      detenerPropagacion
    />
  );
};
