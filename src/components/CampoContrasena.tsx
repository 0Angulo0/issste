import { useState } from "react";
import { TextInput, TextInputProps, useTranslate } from "react-admin";
import { Button, InputAdornment } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

/**
 * ? Campo de contraseña con botón "Mostrar" con TEXTO visible.
 *
 * El <PasswordInput> de react-admin solo trae un icono de ojo; el borrador
 * de diseño pide texto para que quede claro qué hace el botón.
 * El botón va dentro del campo (al final) para que el campo use todo el
 * ancho. Su nombre para lector de pantalla es "Mostrar contraseña".
 * Se usa dentro de un <Form> de react-admin (igual que cualquier TextInput).
 */
export const CampoContrasena = (props: TextInputProps) => {
  const [visible, setVisible] = useState(false);
  const translate = useTranslate();
  const idCampo = props.id ?? props.source;

  return (
    <TextInput
      {...props}
      id={idCampo}
      type={visible ? "text" : "password"}
      fullWidth
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Button
              variant="text"
              size="small"
              onClick={() => setVisible(!visible)}
              aria-controls={idCampo}
              aria-label={translate(
                visible
                  ? "ra.input.password.toggle_visible"
                  : "ra.input.password.toggle_hidden",
              )}
              startIcon={
                visible ? (
                  <VisibilityOffIcon aria-hidden="true" />
                ) : (
                  <VisibilityIcon aria-hidden="true" />
                )
              }
              sx={{ textDecoration: "underline", mr: -1 }}
            >
              {translate(visible ? "contrasena.ocultar" : "contrasena.mostrar")}
            </Button>
          </InputAdornment>
        ),
      }}
    />
  );
};
