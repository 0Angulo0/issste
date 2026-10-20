import { useState } from "react";
import {
  Confirm,
  useNotify,
  useRecordContext,
  useTranslate,
  useUpdate,
} from "react-admin";
import { Button } from "@mui/material";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";

/**
 * ? "Dar de baja" / "Reactivar" un usuario.
 *
 * Dar de baja no borra a la persona: marca activo = false, ya no puede
 * iniciar sesión y el servidor cierra sus sesiones abiertas. Sus registros
 * (mediciones capturadas, bitácora) se conservan. Pide confirmación.
 */
export const BotonBaja = () => {
  const usuario = useRecordContext();
  const translate = useTranslate();
  const notify = useNotify();
  const [abierto, setAbierto] = useState(false);
  const [actualizar, { isPending }] = useUpdate();
  if (!usuario) return null;

  const cambiar = (activo: boolean) =>
    actualizar(
      "usuarios",
      { id: usuario.id, data: { activo }, previousData: usuario },
      {
        mutationMode: "pessimistic",
        onSuccess: () =>
          notify(activo ? "usuarios.reactivado" : "usuarios.baja_lista", {
            type: "success",
          }),
        onError: (e) =>
          notify(
            e instanceof Error ? e.message : "ra.notification.http_error",
            {
              type: "error",
            },
          ),
        onSettled: () => setAbierto(false),
      },
    );

  if (!usuario.activo) {
    return (
      <Button
        variant="outlined"
        startIcon={<PersonAddAlt1Icon aria-hidden="true" />}
        onClick={() => cambiar(true)}
        disabled={isPending}
      >
        {translate("usuarios.reactivar")}
      </Button>
    );
  }
  return (
    <>
      <Button
        variant="outlined"
        color="error"
        startIcon={<PersonOffIcon aria-hidden="true" />}
        onClick={() => setAbierto(true)}
      >
        {translate("usuarios.dar_baja")}
      </Button>
      <Confirm
        isOpen={abierto}
        loading={isPending}
        title={translate("usuarios.baja_titulo", { nombre: usuario.nombre })}
        content="usuarios.baja_contenido"
        confirm="usuarios.dar_baja"
        cancel="ra.action.cancel"
        onConfirm={() => cambiar(false)}
        onClose={() => setAbierto(false)}
      />
    </>
  );
};
