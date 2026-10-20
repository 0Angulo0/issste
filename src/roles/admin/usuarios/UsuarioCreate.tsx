import { Create, SimpleForm, useTranslate } from "react-admin";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { EncabezadoPagina } from "../../../components/EncabezadoPagina";
import { AvisoEstado } from "../../../components/AvisoEstado";
import { BarraGuardarCancelar } from "../../../components/BarraGuardarCancelar";
import { CamposUsuario, prepararUsuario } from "./CamposUsuario";

/**
 * ? Alta de personal. El servidor (POST /usuarios) crea la cuenta SIN
 * contraseña y con una clave de activación AC-XXXXXX, que se muestra al
 * volver a la lista para entregarla a la persona.
 */
export const UsuarioCreate = () => {
  const translate = useTranslate();
  const navigate = useNavigate();
  return (
    <>
      <EncabezadoPagina titulo={translate("usuarios.agregar")} />
      <Create
        title={false}
        transform={prepararUsuario}
        mutationOptions={{
          onSuccess: (usuario) =>
            navigate("/usuarios", {
              state: { claveNueva: usuario.claveActivacion },
            }),
        }}
        sx={{ maxWidth: 760 }}
      >
        <SimpleForm toolbar={<BarraGuardarCancelar />}>
          <Box sx={{ mb: 2, width: "100%" }}>
            <AvisoEstado tipo="info">
              {translate("usuarios.aviso_clave")}
            </AvisoEstado>
          </Box>
          <CamposUsuario />
        </SimpleForm>
      </Create>
    </>
  );
};
