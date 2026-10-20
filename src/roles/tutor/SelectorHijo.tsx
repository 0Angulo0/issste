import { useEffect } from "react";
import { useGetList, useTranslate } from "react-admin";
import { MenuItem, TextField } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import type { Infante } from "../../hooks/useCrecimiento";

/**
 * ? Hija o hijo elegido por la familia.
 *
 * El servidor solo regresa los hijos de este tutor. Si tiene uno, se
 * elige solo; si tiene varios, se muestra un selector. El elegido queda
 * en la URL (?infante=1) para que Inicio, Gráficas e Historial coincidan.
 */
export const useHijoElegido = () => {
  const [parametros, setParametros] = useSearchParams();
  const { data: hijos = [], isPending } = useGetList<Infante>("infantes", {
    sort: { field: "nombre", order: "ASC" },
    pagination: { page: 1, perPage: 50 },
  });
  const elegido = parametros.get("infante");

  useEffect(() => {
    if (!elegido && hijos.length > 0) {
      setParametros({ infante: String(hijos[0].id) }, { replace: true });
    }
  }, [elegido, hijos, setParametros]);

  const elegir = (id: string) =>
    setParametros({ infante: id }, { replace: true });
  const hijo = hijos.find((h) => String(h.id) === elegido) ?? hijos[0];
  return { hijos, hijo, elegir, isPending };
};

export const SelectorHijo = ({
  hijos,
  hijo,
  elegir,
}: ReturnType<typeof useHijoElegido>) => {
  const translate = useTranslate();
  if (hijos.length < 2) return null;
  return (
    <TextField
      select
      label={translate("tutor.elegir_hijo")}
      helperText={translate("tutor.elegir_hijo_ayuda")}
      value={hijo ? String(hijo.id) : ""}
      onChange={(e) => elegir(e.target.value)}
      sx={{ minWidth: 300, mb: 2 }}
    >
      {hijos.map((h) => (
        <MenuItem key={h.id} value={String(h.id)}>
          {`${h.nombre} ${h.apellidos}`}
        </MenuItem>
      ))}
    </TextField>
  );
};
