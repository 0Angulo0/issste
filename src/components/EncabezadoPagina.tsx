import { ReactNode, useEffect } from "react";
import { useTranslate } from "react-admin";
import { Box, Typography } from "@mui/material";
import { colores } from "../theme/theme";

/**
 * ? Encabezado de cada pantalla con sesión: título (h1), línea dorada,
 * subtítulo opcional y botones de acción a la derecha (como en los borradores).
 *
 * También cambia el título de la pestaña del navegador (WCAG 2.4.2):
 * el título de react-admin no se ve porque nuestra barra superior lo reemplaza.
 */
export const EncabezadoPagina = ({
  titulo,
  subtitulo,
  acciones,
}: {
  titulo: string;
  subtitulo?: ReactNode;
  acciones?: ReactNode;
}) => {
  const translate = useTranslate();

  useEffect(() => {
    document.title = `${titulo} · ${translate("app.nombre")}`;
  }, [titulo, translate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        justifyContent: "space-between",
        alignItems: "flex-start",
        mt: 3,
        mb: 2,
      }}
    >
      <Box>
        <Typography variant="h1" component="h1">
          {titulo}
        </Typography>
        <Box
          aria-hidden="true"
          sx={{
            width: 72,
            height: 4,
            backgroundColor: colores.dorado,
            borderRadius: 2,
            my: 1,
          }}
        />
        {subtitulo && (
          <Typography sx={{ fontSize: "1.1rem", color: "#333" }}>
            {subtitulo}
          </Typography>
        )}
      </Box>
      {acciones && (
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {acciones}
        </Box>
      )}
    </Box>
  );
};
