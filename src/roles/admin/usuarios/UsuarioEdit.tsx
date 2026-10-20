import {
  BooleanInput,
  Edit,
  SimpleForm,
  useNotify,
  useRecordContext,
  useRedirect,
  useTranslate,
} from "react-admin";
import { EncabezadoPagina } from "../../../components/EncabezadoPagina";
import { BarraGuardarCancelar } from "../../../components/BarraGuardarCancelar";
import { CamposUsuario, prepararUsuario } from "./CamposUsuario";

/**
 * ? Editar rol / datos de un usuario. Guardado "pesimista": espera la
 * respuesta del servidor antes de avisar, para que un error (ej. correo
 * repetido o darse de baja a sí mismo) se vea de inmediato.
 */
const Titulo = () => {
  const usuario = useRecordContext();
  const translate = useTranslate();
  return (
    <EncabezadoPagina
      titulo={`${translate("usuarios.editar_rol")}: ${usuario?.nombre ?? ""}`}
    />
  );
};

export const UsuarioEdit = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  return (
    <Edit
      title={false}
      actions={false}
      component="div"
      mutationMode="pessimistic"
      transform={prepararUsuario}
      mutationOptions={{
        onSuccess: () => {
          notify("usuarios.guardado", { type: "success" });
          redirect("list", "usuarios");
        },
      }}
      sx={{ maxWidth: 760 }}
    >
      <Titulo />
      <SimpleForm
        toolbar={<BarraGuardarCancelar />}
        sx={{ backgroundColor: "#fff", borderRadius: 2 }}
      >
        <CamposUsuario />
        <BooleanInput source="activo" />
      </SimpleForm>
    </Edit>
  );
};
