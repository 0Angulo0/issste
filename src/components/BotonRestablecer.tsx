import { useState } from "react";
import {
  Confirm,
  useDataProvider,
  useNotify,
  useRefresh,
  useTranslate,
} from "react-admin";
import { Box, Button } from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import { AvisoEstado } from "./AvisoEstado";
import type { DataProviderPadron } from "../providers/dataProvider";

/**
 * ? Botón "Restablecer acceso" (familias) / "Restablecer contraseña" (personal).
 *
 * 1. Pide confirmación (diálogo <Confirm> de react-admin, manejable con teclado).
 * 2. El servidor genera una clave NUEVA, borra la contraseña anterior y
 *    cierra las sesiones abiertas de esa cuenta (POST /auth/restablecer).
 * 3. Se muestra la clave en un aviso (role="status") para entregarla; la
 *    persona crea su contraseña nueva en "Primer acceso".
 */
export const BotonRestablecer = ({
  tipo,
  cuentaId,
  etiqueta,
  nombre,
}: {
  tipo: "tutor" | "usuario";
  cuentaId: number;
  etiqueta: string;
  nombre: string;
}) => {
  const translate = useTranslate();
  const dataProvider = useDataProvider<DataProviderPadron>();
  const notify = useNotify();
  const refresh = useRefresh();
  const [abierto, setAbierto] = useState(false);
  const [trabajando, setTrabajando] = useState(false);
  const [clave, setClave] = useState<string | null>(null);

  const confirmar = async () => {
    setTrabajando(true);
    try {
      const respuesta = await dataProvider.restablecerAcceso(tipo, cuentaId);
      setClave(respuesta.clave);
      refresh(); //^ la clave nueva también se ve en el expediente
    } catch (e) {
      notify(e instanceof Error ? e.message : "ra.notification.http_error", {
        type: "error",
      });
    } finally {
      setTrabajando(false);
      setAbierto(false);
    }
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<LockResetIcon aria-hidden="true" />}
        onClick={() => setAbierto(true)}
      >
        {translate(etiqueta)}
      </Button>
      <Confirm
        isOpen={abierto}
        loading={trabajando}
        title="restablecer.titulo"
        content={translate("restablecer.contenido", { nombre })}
        confirm="restablecer.confirmar"
        cancel="ra.action.cancel"
        onConfirm={confirmar}
        onClose={() => setAbierto(false)}
      />
      {clave && (
        <Box sx={{ mt: 1.5 }}>
          <AvisoEstado tipo="exito">
            {translate("restablecer.listo")}{" "}
            <Box
              component="strong"
              sx={{ fontSize: "1.2rem", letterSpacing: 1 }}
            >
              {clave}
            </Box>
            <Box
              component="span"
              sx={{ display: "block", fontWeight: 400, mt: 0.5 }}
            >
              {translate(
                tipo === "tutor"
                  ? "restablecer.instrucciones_familia"
                  : "restablecer.instrucciones_personal",
              )}
            </Box>
          </AvisoEstado>
        </Box>
      )}
    </Box>
  );
};
