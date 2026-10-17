import { ReactNode, useEffect } from "react";
import { useTranslate } from "react-admin";
import { Box, Card, Typography } from "@mui/material";
import logo from "../recursos/Logo_gobierno.png";
import { colores } from "../theme/theme";

/**
 * ? Marco común de las pantallas sin sesión (Login y Primer acceso):
 * tarjeta centrada con logo oficial, nombre del sistema y título.
 *
 * - <main> marca el contenido principal para lectores de pantalla.
 * - El título de la pestaña cambia en cada pantalla (WCAG 2.4.2).
 */
export const MarcoAcceso = ({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) => {
  const translate = useTranslate();

  useEffect(() => {
    document.title = `${titulo} · ${translate("app.nombre")}`;
  }, [titulo, translate]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colores.fondo,
        borderTop: `6px solid ${colores.guinda}`,
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 520,
          p: { xs: 3, sm: 5 },
          borderRadius: "14px",
          border: `1px solid ${colores.borde}`,
          boxShadow: "none",
        }}
      >
        <Box
          component="img"
          src={logo}
          alt={translate("app.logo_alt")}
          sx={{ height: 56, display: "block", mb: 2 }}
        />
        <Typography
          sx={{ fontWeight: 700, fontSize: "1.6rem", color: colores.guinda }}
        >
          {translate("app.nombre")}
        </Typography>
        <Typography sx={{ fontSize: "0.9rem", color: "#444" }}>
          {translate("app.institucion")}
        </Typography>
        {/* línea dorada decorativa, como en el borrador */}
        <Box
          aria-hidden="true"
          sx={{
            width: 72,
            height: 4,
            backgroundColor: colores.dorado,
            borderRadius: 2,
            my: 2,
          }}
        />
        <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
          {titulo}
        </Typography>
        {children}
      </Card>
    </Box>
  );
};
