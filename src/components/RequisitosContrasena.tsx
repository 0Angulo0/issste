import { Fragment, ReactNode, useEffect, useState } from "react";
import { useTranslate } from "react-admin";
import { Box, Typography } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { evaluarReglasBasicas } from "../utils/reglasContrasena.js";
import { colores } from "../theme/theme";

/**
 * ? Lista de requisitos de la contraseña que se actualiza mientras se escribe.
 *
 * Accesibilidad:
 * - Cada requisito tiene icono ✓/✗ + texto + "(cumple)/(falta)" oculto
 *   para lectores de pantalla: no depende solo del color verde/rojo.
 * - Un resumen ("Cumples 5 de 7 requisitos") se anuncia con aria-live,
 *   esperando a que la persona deje de escribir para no interrumpir.
 * - La regla de datos personales solo la puede revisar el servidor
 *   (el navegador no conoce esos datos); se marca ✗ si el servidor la rechaza.
 */
export const RequisitosContrasena = ({
  contrasena,
  fallaPersonales = false,
  id,
}: {
  contrasena: string;
  fallaPersonales?: boolean;
  id: string;
}) => {
  const translate = useTranslate();
  const reglas = evaluarReglasBasicas(contrasena);
  const cumplidas = reglas.filter((r) => r.cumple).length;

  //^ resumen para lector de pantalla, con retraso de 1 s
  const [resumen, setResumen] = useState("");
  useEffect(() => {
    if (!contrasena) return;
    const t = setTimeout(
      () =>
        setResumen(
          translate("contrasena.resumen", {
            cumplidas,
            total: reglas.length,
          }),
        ),
      1000,
    );
    return () => clearTimeout(t);
  }, [contrasena, cumplidas, reglas.length, translate]);

  const fila = (icono: ReactNode, texto: string, estado: string) => (
    <Box
      component="li"
      sx={{ display: "flex", gap: 1, alignItems: "flex-start", mb: 0.75 }}
    >
      {icono}
      <span>
        {texto}
        <Box component="span" sx={visuallyHidden}>
          {` (${estado})`}
        </Box>
      </span>
    </Box>
  );

  return (
    <Box id={id}>
      <Typography component="h2" sx={{ fontWeight: 700, mb: 1 }}>
        {translate("contrasena.titulo")}
      </Typography>
      <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
        {reglas.map((r) => (
          <Fragment key={r.id}>
            {fila(
              r.cumple ? (
                <CheckCircleIcon
                  aria-hidden="true"
                  sx={{ color: colores.exito }}
                />
              ) : (
                <CancelIcon aria-hidden="true" sx={{ color: colores.error }} />
              ),
              translate(r.mensaje),
              translate(r.cumple ? "contrasena.cumple" : "contrasena.falta"),
            )}
          </Fragment>
        ))}
        {fila(
          fallaPersonales ? (
            <CancelIcon aria-hidden="true" sx={{ color: colores.error }} />
          ) : (
            <InfoOutlinedIcon aria-hidden="true" sx={{ color: "#0B5CAD" }} />
          ),
          translate("contrasena.reglas.personales"),
          translate(
            fallaPersonales ? "contrasena.falta" : "contrasena.al_guardar",
          ),
        )}
      </Box>
      <Box aria-live="polite" sx={visuallyHidden}>
        {resumen}
      </Box>
    </Box>
  );
};
