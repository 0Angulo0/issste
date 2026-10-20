import { SaveButton, Toolbar, useTranslate } from "react-admin";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

/**
 * ? Barra de botones de los formularios: "Guardar" y "Cancelar", con texto.
 *
 * - alwaysEnable: "Guardar" siempre se puede presionar. Si falta algo, al
 *   presionarlo se marcan los errores en cada campo. Un botón deshabilitado
 *   no explica qué falta y algunos lectores de pantalla ni lo anuncian.
 * - "Cancelar" regresa a la pantalla anterior sin guardar.
 */
export const BarraGuardarCancelar = ({
  textoGuardar,
}: {
  textoGuardar?: string;
}) => {
  const translate = useTranslate();
  const navigate = useNavigate();
  return (
    <Toolbar
      sx={{
        gap: 1.5,
        backgroundColor: "transparent",
        px: "0 !important",
        //^ en celular react-admin la fija abajo y tapa el contenido; la dejamos en su lugar
        "&.RaToolbar-mobileToolbar": { position: "static" },
      }}
    >
      <SaveButton alwaysEnable label={textoGuardar ?? "ra.action.save"} />
      <Button variant="outlined" onClick={() => navigate(-1)}>
        {translate("ra.action.cancel")}
      </Button>
    </Toolbar>
  );
};
