import {
  AppBar as RaAppBar,
  LoadingIndicator,
  useLogout,
  usePermissions,
  useTranslate,
} from "react-admin";
import { Box, Button, Chip, Typography } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LockIcon from "@mui/icons-material/Lock";
import logo from "../recursos/Logo_gobierno.png";
import { colores } from "../theme/theme";
import { leerSesion } from "../providers/authProvider";

/**
 * Lado derecho de la barra: rol, región fija (coordinador) y botón de
 * cerrar sesión con TEXTO visible, no solo un icono (hallazgo de la
 * Evidencia 1.1: en Yollot el botón de salir no era accesible).
 */
const BarraDerecha = () => {
  const translate = useTranslate();
  const logout = useLogout();
  const { permissions: rol } = usePermissions();
  const region = leerSesion()?.region;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <LoadingIndicator />
      {rol === "coordinador" && region && (
        <Box
          component="span"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontWeight: 700,
          }}
        >
          <LockIcon aria-hidden="true" />
          {translate("app.region_fija", { region })}
        </Box>
      )}
      {rol && (
        <Chip
          label={translate(`roles.${rol}`)}
          variant="outlined"
          sx={{ borderColor: colores.dorado, borderWidth: 2, fontWeight: 600 }}
        />
      )}
      <Button
        variant="outlined"
        color="primary"
        startIcon={<LogoutIcon aria-hidden="true" />}
        onClick={() => logout()}
      >
        {translate("ra.auth.logout")}
      </Button>
    </Box>
  );
};

export const AppBar = () => {
  const translate = useTranslate();
  return (
    <RaAppBar
      userMenu={false}
      toolbar={<BarraDerecha />}
      // Barra blanca: el logo oficial no tiene suficiente contraste sobre guinda.
      sx={{
        backgroundColor: "#fff",
        color: colores.negro,
        borderTop: `4px solid ${colores.guinda}`,
        borderBottom: `1px solid ${colores.borde}`,
        boxShadow: "none",
      }}
    >
      <Box
        component="img"
        src={logo}
        alt={translate("app.logo_alt")}
        sx={{ height: 40, mr: 2 }}
      />
      <Typography
        component="span"
        sx={{ fontWeight: 700, fontSize: "1.25rem", color: colores.guinda }}
      >
        {translate("app.nombre")}
      </Typography>
      <Box sx={{ flex: 1 }} />
    </RaAppBar>
  );
};
