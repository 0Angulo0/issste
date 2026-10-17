import { useState } from "react";
import {
  Form,
  TextInput,
  required,
  useNotify,
  useTranslate,
} from "react-admin";
import { useWatch } from "react-hook-form";
import { Box, Button, Link } from "@mui/material";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { MarcoAcceso } from "./MarcoAcceso";
import { CampoContrasena } from "../components/CampoContrasena";
import { AvisoEstado } from "../components/AvisoEstado";
import { RequisitosContrasena } from "../components/RequisitosContrasena";
import {
  ErrorPrimerAcceso,
  crearContrasenaPrimerAcceso,
} from "../providers/authProvider";
import { evaluarReglasBasicas } from "../utils/reglasContrasena.js";

/**
 * ? Primer acceso del padre, madre o tutor.
 *
 * Al dar de alta a un infante, la estancia entrega a la familia una clave
 * (ej. PI-7K3M9Q). Aquí el tutor escribe esa clave y crea su contraseña.
 * La contraseña se valida en vivo (RequisitosContrasena) y de nuevo en el
 * servidor, que es quien la convierte a hash con bcrypt.
 * Si todo sale bien, regresa al login con la clave ya escrita.
 */

const cumpleReglas = (valor: string) =>
  valor && evaluarReglasBasicas(valor).some((r) => !r.cumple)
    ? "contrasena.errores.no_cumple"
    : undefined;

const coincide = (valor: string, valores: Record<string, string>) =>
  valor && valor !== valores.password
    ? "contrasena.errores.no_coincide"
    : undefined;

/** Lee la contraseña mientras se escribe para pintar los requisitos. */
const RequisitosEnVivo = ({
  fallaPersonales,
}: {
  fallaPersonales: boolean;
}) => {
  const contrasena = useWatch({ name: "password" }) ?? "";
  return (
    <RequisitosContrasena
      id="requisitos-contrasena"
      contrasena={contrasena}
      fallaPersonales={fallaPersonales}
    />
  );
};

export const PrimerAcceso = () => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const notify = useNotify();
  const [parametros] = useSearchParams();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallaPersonales, setFallaPersonales] = useState(false);

  const enviar = async (valores: Record<string, string>) => {
    setEnviando(true);
    setError(null);
    setFallaPersonales(false);
    const clave = valores.clave.trim().toUpperCase();
    try {
      await crearContrasenaPrimerAcceso(clave, valores.password);
      notify("primer_acceso.exito", { type: "success" });
      //? Regresamos al login con la clave ya escrita. No iniciamos sesión
      //? aquí porque esta ruta vive fuera de la sesión de react-admin, y
      //? así el tutor confirma que recuerda su nueva contraseña.
      navigate("/login", { state: { usuario: clave } });
    } catch (e) {
      if (e instanceof ErrorPrimerAcceso) {
        setFallaPersonales(e.fallas.includes("personales"));
        setError(e.message);
      } else {
        setError("ra.notification.http_error");
      }
      setEnviando(false);
    }
  };

  return (
    <MarcoAcceso titulo={translate("primer_acceso.titulo")}>
      <Box sx={{ mb: 2 }}>
        <AvisoEstado tipo="info">
          {translate("primer_acceso.instrucciones")}
        </AvisoEstado>
      </Box>
      {error && (
        <Box sx={{ mb: 2 }}>
          <AvisoEstado tipo="error">{translate(error)}</AvisoEstado>
        </Box>
      )}

      <Form
        onSubmit={enviar}
        noValidate
        defaultValues={{ clave: parametros.get("clave") ?? "" }}
      >
        <TextInput
          source="clave"
          label={translate("primer_acceso.clave")}
          helperText={translate("primer_acceso.clave_ayuda")}
          validate={required()}
          autoComplete="username"
          fullWidth
        />
        <CampoContrasena
          source="password"
          label={translate("primer_acceso.nueva")}
          validate={[required(), cumpleReglas]}
          autoComplete="new-password"
          //^ asocia el campo con la lista de requisitos para el lector de pantalla
          inputProps={{ "aria-describedby": "requisitos-contrasena" }}
          helperText={false}
          fullWidth
        />
        <Box sx={{ my: 2 }}>
          <RequisitosEnVivo fallaPersonales={fallaPersonales} />
        </Box>
        <CampoContrasena
          source="confirmacion"
          label={translate("primer_acceso.confirmar")}
          validate={[required(), coincide]}
          autoComplete="new-password"
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
          {translate(
            enviando ? "primer_acceso.guardando" : "primer_acceso.guardar",
          )}
        </Button>
      </Form>

      <Link component={RouterLink} to="/login">
        {translate("primer_acceso.volver")}
      </Link>
    </MarcoAcceso>
  );
};
