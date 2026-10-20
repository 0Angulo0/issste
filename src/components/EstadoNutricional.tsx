import { useTranslate } from "react-admin";
import { Box, Card, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import type { Evaluacion } from "../utils/nutricion.js";
import { colores } from "../theme/theme";

/**
 * ? Tarjeta con el estado nutricional de la última medición.
 *
 * Icono + título + explicación en palabras sencillas: el estado no se
 * comunica solo con color. En modoFamilia el texto está pensado para
 * padres, madres o tutores con poca experiencia técnica.
 */
export const EstadoNutricional = ({
  evaluacion,
  nombre,
  modoFamilia = false,
}: {
  evaluacion: Evaluacion;
  nombre: string;
  modoFamilia?: boolean;
}) => {
  const translate = useTranslate();
  const { estado, tallaBaja, alerta } = evaluacion;
  const sinDato = estado === "sin_dato";
  const tono = sinDato
    ? {
        borde: "#0B5CAD",
        fondo: "#EEF3F8",
        texto: "#0b3a6b",
        Icono: HelpOutlineIcon,
      }
    : alerta
      ? {
          borde: "#8A4B00",
          fondo: "#FFF4E5",
          texto: "#5c3200",
          Icono: WarningAmberIcon,
        }
      : {
          borde: colores.exito,
          fondo: "#F2FAF5",
          texto: "#14532d",
          Icono: CheckCircleOutlineIcon,
        };
  const { Icono } = tono;
  const modo = modoFamilia ? "familia" : "personal";

  return (
    <Card
      variant="outlined"
      sx={{
        border: `2px solid ${tono.borde}`,
        backgroundColor: tono.fondo,
        p: 2.5,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
        <Icono aria-hidden="true" sx={{ fontSize: 44, color: tono.borde }} />
        <Typography
          component="h2"
          sx={{ fontSize: "1.5rem", fontWeight: 700, color: tono.texto }}
        >
          {translate(`nutricion.titulo.${estado}`)}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: "1.1rem", mt: 1.5 }}>
        {translate(`nutricion.${modo}.${estado}`, { nombre })}
      </Typography>
      {tallaBaja && (
        <Typography sx={{ fontSize: "1.1rem", mt: 1, fontWeight: 600 }}>
          {translate(`nutricion.${modo}.talla_baja`, { nombre })}
        </Typography>
      )}
    </Card>
  );
};
