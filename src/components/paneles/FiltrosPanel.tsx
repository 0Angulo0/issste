import { FormEvent, useState } from "react";
import { useGetList, useTranslate } from "react-admin";
import { Box, Button, MenuItem, TextField } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import LockIcon from "@mui/icons-material/Lock";
import { AvisoEstado } from "../AvisoEstado";
import type { FiltrosIndicadores } from "../../providers/dataProvider";
import { formatearPeriodo, periodoActual } from "../../utils/fechas";

/**
 * ? Filtros de los paneles (coordinador y administrador).
 *
 * - Cada filtro tiene etiqueta visible.
 * - Se aplican con el botón "Aplicar filtros" (o Enter): así la información
 *   no cambia "sola" mientras se elige.
 * - Al aplicar aparece "Filtros aplicados: …" (role="status"). En el panel
 *   del SNDIF no había indicador de que el filtro se aplicó (Evidencia 1.1).
 * - Las opciones de estancia, región y estado salen del servidor, que solo
 *   regresa las estancias del alcance del rol.
 */
type Campo = "estancia" | "periodo" | "region" | "entidad";

interface Estancia {
  id: number;
  nombre: string;
  region: string;
  estado: string;
}

export const FiltrosPanel = ({
  campos,
  onAplicar,
  regionFija,
}: {
  campos: Campo[];
  onAplicar: (filtros: FiltrosIndicadores) => void;
  regionFija?: string | null;
}) => {
  const translate = useTranslate();
  const { data: estancias = [] } = useGetList<Estancia>("estancias", {
    sort: { field: "nombre", order: "ASC" },
    pagination: { page: 1, perPage: 500 },
  });
  const [valores, setValores] = useState<FiltrosIndicadores>({
    periodo: periodoActual(),
    estanciaId: "",
    region: "",
    entidad: "",
  });
  const [aplicados, setAplicados] = useState<string | null>(null);

  const regiones = [...new Set(estancias.map((e) => e.region))].sort();
  const entidades = [...new Set(estancias.map((e) => e.estado))].sort();
  //^ si ya se eligió región o estado, solo se ofrecen sus estancias
  const estanciasVisibles = estancias.filter(
    (e) =>
      (!valores.region || e.region === valores.region) &&
      (!valores.entidad || e.estado === valores.entidad),
  );

  const cambiar = (campo: keyof FiltrosIndicadores, valor: string) =>
    setValores({ ...valores, [campo]: valor });

  const aplicar = (evento: FormEvent) => {
    evento.preventDefault();
    onAplicar(valores);
    //? texto del aviso: qué quedó aplicado, en palabras
    const partes = [];
    if (campos.includes("entidad"))
      partes.push(valores.entidad || translate("panel.todas_entidades"));
    if (campos.includes("region"))
      partes.push(valores.region || translate("panel.todas_regiones"));
    if (campos.includes("estancia"))
      partes.push(
        estancias.find((e) => String(e.id) === String(valores.estanciaId))
          ?.nombre ?? translate("panel.todas_estancias"),
      );
    if (valores.periodo) partes.push(formatearPeriodo(valores.periodo));
    setAplicados(translate("panel.aplicados", { filtros: partes.join(" · ") }));
  };

  const selector = (
    campo: keyof FiltrosIndicadores,
    etiqueta: string,
    todos: string,
    opciones: { valor: string; texto: string }[],
  ) => (
    <TextField
      select
      label={translate(etiqueta)}
      value={valores[campo] ?? ""}
      onChange={(e) => cambiar(campo, e.target.value)}
      sx={{ minWidth: 220 }}
    >
      <MenuItem value="">{translate(todos)}</MenuItem>
      {opciones.map((o) => (
        <MenuItem key={o.valor} value={o.valor}>
          {o.texto}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        component="form"
        onSubmit={aplicar}
        aria-label={translate("panel.filtros")}
        sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}
      >
        {campos.includes("entidad") &&
          selector(
            "entidad",
            "panel.entidad",
            "panel.todas_entidades",
            entidades.map((e) => ({ valor: e, texto: e })),
          )}
        {campos.includes("region") &&
          selector(
            "region",
            "panel.region",
            "panel.todas_regiones",
            regiones.map((r) => ({ valor: r, texto: r })),
          )}
        {campos.includes("estancia") &&
          selector(
            "estanciaId",
            "panel.estancia",
            "panel.todas_estancias",
            estanciasVisibles.map((e) => ({
              valor: String(e.id),
              texto: e.nombre,
            })),
          )}
        {campos.includes("periodo") && (
          <TextField
            type="month"
            label={translate("panel.periodo")}
            helperText={translate("panel.periodo_ayuda")}
            value={valores.periodo}
            onChange={(e) => cambiar("periodo", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        )}
        <Button
          type="submit"
          variant="contained"
          startIcon={<FilterAltIcon aria-hidden="true" />}
        >
          {translate("panel.aplicar")}
        </Button>
        {regionFija && (
          <Box
            component="span"
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              fontWeight: 600,
            }}
          >
            <LockIcon aria-hidden="true" />
            {translate("app.region_fija", { region: regionFija })}
          </Box>
        )}
      </Box>
      {aplicados && (
        <Box sx={{ mt: 1.5 }}>
          <AvisoEstado tipo="info">{aplicados}</AvisoEstado>
        </Box>
      )}
    </Box>
  );
};
