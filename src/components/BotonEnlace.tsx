import { ReactElement, MouseEvent } from "react";
import { useTranslate } from "react-admin";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";

/**
 * ? Botón que lleva a otra pantalla, con texto SIEMPRE visible.
 *
 * - Es un enlace (<a href>) con aspecto de botón: el lector de pantalla lo
 *   anuncia como "enlace" porque navega, y se abre con Tab + Enter.
 * - Usamos el Button de MUI (no el de react-admin ni CreateButton/ShowButton):
 *   los de react-admin esconden el texto en pantallas chicas y dejan solo
 *   un icono, y aquí queremos que el texto se lea siempre.
 */
export const BotonEnlace = ({
  to,
  label,
  icono,
  variant = "contained",
  detenerPropagacion = false,
}: {
  to: string;
  label: string; //^ llave de traducción
  icono?: ReactElement;
  variant?: "contained" | "outlined" | "text";
  //^ dentro de una fila de tabla, que el clic no abra también la fila
  detenerPropagacion?: boolean;
}) => {
  const translate = useTranslate();
  return (
    <Button
      component={Link}
      to={to}
      variant={variant}
      startIcon={icono}
      onClick={
        detenerPropagacion ? (e: MouseEvent) => e.stopPropagation() : undefined
      }
    >
      {translate(label)}
    </Button>
  );
};
