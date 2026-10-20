import { ReactNode } from "react";
import { Box, Card, Typography } from "@mui/material";
import { colores } from "../theme/theme";

/**
 * ? Tarjeta de un número importante (ej. "2,340 Niñas y niños atendidos").
 * Icono + número grande + texto: el significado no depende del color.
 */
export const TarjetaIndicador = ({
  icono,
  valor,
  texto,
}: {
  icono: ReactNode;
  valor: ReactNode;
  texto: string;
}) => (
  <Card
    variant="outlined"
    sx={{
      p: 2.5,
      display: "flex",
      gap: 2,
      alignItems: "center",
      flex: 1,
      minWidth: 220,
    }}
  >
    <Box
      aria-hidden="true"
      sx={{
        width: 52,
        height: 52,
        borderRadius: "12px",
        backgroundColor: "#F4E9EE",
        color: colores.guinda,
        display: "grid",
        placeItems: "center",
        flex: "none",
      }}
    >
      {icono}
    </Box>
    <Box>
      <Typography sx={{ fontSize: "1.9rem", fontWeight: 700, lineHeight: 1.1 }}>
        {valor}
      </Typography>
      <Typography>{texto}</Typography>
    </Box>
  </Card>
);
