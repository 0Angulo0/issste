import { useState } from "react";
import { Form, TextInput, required, useLogin, useTranslate } from "react-admin";
import { Box, Button, Link, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { MarcoAcceso } from "./MarcoAcceso";
import { CampoContrasena } from "../components/CampoContrasena";
import { AvisoEstado } from "../components/AvisoEstado";

/**
 * ? Pantalla 1: Inicio de sesión.
 *
 * Un solo campo de usuario para todos los roles:
 *   - Personal (admin, coordinador, estancia): correo institucional
 *   - Padres, madres o tutores: clave de acceso (ej. PI-7K3M9Q)
 *
 * Accesibilidad (hallazgos de la Evidencia 1.1 en Yollot):
 *   - Cada campo tiene <label> visible y asociado (lo hace TextInput).
 *   - Errores con icono + texto, y el campo se marca aria-invalid.
 *   - "Mostrar contraseña" es un botón con texto, no solo un icono.
 *   - El error del servidor se anuncia con role="alert".
 */

//? Formatos aceptados en el campo de usuario
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CLAVE = /^PI-?[A-Z0-9]{6}$/i;

const formatoUsuario = (valor: string) => {
  if (!valor) return undefined; //^ "required" ya cubre el campo vacío
  const texto = valor.trim();
  if (texto.includes("@")) {
    return CORREO.test(texto) ? undefined : "login.errores.correo";
  }
  return CLAVE.test(texto) ? undefined : "login.errores.clave";
};

export const LoginPage = () => {
  const translate = useTranslate();
  const login = useLogin();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ayudaVisible, setAyudaVisible] = useState(false);
  //^ al volver de "Primer acceso" llega la clave para no escribirla otra vez
  const usuarioPrevio: string = useLocation().state?.usuario ?? "";
  const [ultimoUsuario, setUltimoUsuario] = useState(usuarioPrevio);

  const enviar = async (valores: Record<string, string>) => {
    setEnviando(true);
    setError(null);
    setUltimoUsuario(valores.usuario.trim());
    try {
      //^ authProvider.login -> POST /auth/login (bcrypt se ejecuta en el servidor)
      await login({
        username: valores.usuario.trim(),
        password: valores.password,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "auth.login_failed");
      setEnviando(false);
    }
  };

  return (
    <MarcoAcceso titulo={translate("login.titulo")}>
      {error && (
        <Box sx={{ mb: 2 }}>
          <AvisoEstado tipo="error">
            {translate(error)}
            {error === "auth.primer_acceso_pendiente" && (
              <>
                {" "}
                <Link
                  component={RouterLink}
                  //^ la clave se precarga solo si es de familia (el personal usa correo)
                  to={
                    ultimoUsuario.includes("@")
                      ? "/primer-acceso"
                      : `/primer-acceso?clave=${encodeURIComponent(ultimoUsuario)}`
                  }
                >
                  {translate("login.ir_primer_acceso")}
                </Link>
              </>
            )}
          </AvisoEstado>
        </Box>
      )}

      <Form
        onSubmit={enviar}
        noValidate
        defaultValues={{ usuario: usuarioPrevio }}
      >
        <TextInput
          source="usuario"
          label={translate("login.usuario")}
          helperText={translate("login.usuario_ayuda")}
          validate={[required(), formatoUsuario]}
          autoComplete="username"
          autoFocus={!usuarioPrevio}
          fullWidth
        />
        <CampoContrasena
          source="password"
          label={translate("login.contrasena")}
          validate={required()}
          autoComplete="current-password"
          //^ si la clave ya viene escrita, el foco va directo a la contraseña
          autoFocus={!!usuarioPrevio}
          helperText={false}
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={enviando}
          sx={{ mt: 1, mb: 2.5 }}
        >
          {translate(enviando ? "login.ingresando" : "login.ingresar")}
        </Button>
      </Form>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Link component={RouterLink} to="/primer-acceso">
          {translate("login.primer_acceso")}
        </Link>
        <Box>
          {/* Botón con aspecto de enlace que muestra/oculta la ayuda */}
          <Button
            variant="text"
            onClick={() => setAyudaVisible(!ayudaVisible)}
            aria-expanded={ayudaVisible}
            aria-controls="ayuda-contrasena"
            sx={{ p: 0, minHeight: 44, textDecoration: "underline" }}
          >
            {translate("login.olvide")}
          </Button>
          {ayudaVisible && (
            <Typography id="ayuda-contrasena" sx={{ mt: 1 }}>
              {translate("login.olvide_ayuda")}
            </Typography>
          )}
        </Box>
      </Box>
    </MarcoAcceso>
  );
};
