import { ReactNode } from "react";
import { Box } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { colores } from "../theme/theme";

/**
 * ? Aviso con icono + texto (nunca solo color).
 *
 * - exito / info -> role="status": el lector de pantalla lo lee sin interrumpir
 * - error        -> role="alert":  el lector lo lee de inmediato
 *
 * Hallazgo de la Evidencia 1.1: Yollot no avisaba al guardar; aquí cada
 * acción importante muestra un AvisoEstado.
 */
type Tipo = "exito" | "error" | "info";

const estilos: Record<Tipo, { fondo: string; borde: string; texto: string }> = {
  exito: { fondo: "#E8F5EC", borde: colores.exito, texto: "#14532d" },
  error: { fondo: "#FDECEE", borde: colores.error, texto: "#7a0016" },
  info: { fondo: "#EEF3F8", borde: "#0B5CAD", texto: "#0b3a6b" },
};

const iconos: Record<Tipo, ReactNode> = {
  exito: <CheckCircleOutlineIcon aria-hidden="true" />,
  error: <ErrorOutlineIcon aria-hidden="true" />,
  info: <InfoOutlinedIcon aria-hidden="true" />,
};

export const AvisoEstado = ({
  tipo,
  children,
}: {
  tipo: Tipo;
  children: ReactNode;
}) => {
  const e = estilos[tipo];
  return (
    <Box
      role={tipo === "error" ? "alert" : "status"}
      sx={{
        display: "flex",
        gap: 1.25,
        alignItems: "flex-start",
        p: "12px 16px",
        borderRadius: "10px",
        border: `2px solid ${e.borde}`,
        backgroundColor: e.fondo,
        color: e.texto,
        //^ las instrucciones (info) suelen ser largas: sin negritas se leen mejor
        fontWeight: tipo === "info" ? 400 : 600,
        "& > svg": { color: e.borde, flex: "none" },
      }}
    >
      {iconos[tipo]}
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
};
