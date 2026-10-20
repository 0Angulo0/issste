import { useTranslate } from "react-admin";
import { GraficaBarras } from "../graficas/GraficaBarras";
import { ESTADOS } from "../../utils/nutricion.js";

/**
 * ? "Estado nutricional (%)": cuántas niñas y niños hay en cada estado,
 * en porcentaje de quienes tienen medición. Reemplaza los "Indicadores de
 * desarrollo" del borrador (esos datos no existen en el sistema).
 */

//? Colores distinguibles con daltonismo; el número escrito y la tabla
//? hacen que no dependa del color.
const COLOR: Record<string, string> = {
  bajo: "#C2410C",
  adecuado: "#0B5CAD",
  sobrepeso: "#B45309",
  obesidad: "#7C2D12",
  alto: "#6B21A8",
};

export const GraficaEstados = ({
  distribucion,
}: {
  distribucion: Record<string, number>;
}) => {
  const translate = useTranslate();
  const estados = ESTADOS.filter((e) => e !== "sin_dato");
  const total = estados.reduce((s, e) => s + (distribucion[e] ?? 0), 0);
  //^ se muestran siempre bajo/adecuado/sobrepeso/obesidad; "alto" solo si hay casos
  const visibles = estados.filter((e) => e !== "alto" || distribucion[e] > 0);

  return (
    <GraficaBarras
      titulo={translate("panel.estado_nutricional")}
      etiquetas={visibles.map((e) => translate(`nutricion.estado.${e}`))}
      valores={visibles.map((e) =>
        total ? Math.round(((distribucion[e] ?? 0) / total) * 100) : 0,
      )}
      sufijo="%"
      etiquetaValor={translate("panel.porcentaje")}
      colores={visibles.map((e) => COLOR[e])}
    />
  );
};
