import "./registrarChart";
import { Bar } from "react-chartjs-2";
import type { ChartOptions, Plugin } from "chart.js";
import { Box } from "@mui/material";
import { VerComoTabla } from "../VerComoTabla";

/**
 * ? Gráfica de barras con el valor escrito sobre cada barra (chart.js).
 *
 * - El número está escrito: no hay que adivinarlo por la altura ni por el color.
 * - Barras con borde negro: se distinguen del fondo aunque no se vea el color.
 * - aria-label con todos los valores + "Ver como tabla".
 */

//? Plugin pequeño (sin librerías extra) que escribe el valor arriba de cada barra
const valoresSobreBarras = (sufijo: string): Plugin<"bar"> => ({
  id: "valoresSobreBarras",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    ctx.save();
    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#1A1A1A";
    ctx.textAlign = "center";
    chart.getDatasetMeta(0).data.forEach((barra, i) => {
      const valor = chart.data.datasets[0].data[i] as number;
      ctx.fillText(
        `${valor.toLocaleString("es-MX")}${sufijo}`,
        barra.x,
        barra.y - 8,
      );
    });
    ctx.restore();
  },
});

export const GraficaBarras = ({
  titulo,
  etiquetas,
  valores,
  sufijo = "",
  etiquetaValor,
  colores,
}: {
  titulo: string;
  etiquetas: string[];
  valores: number[];
  sufijo?: string;
  etiquetaValor: string; //^ encabezado de la columna de valores en la tabla
  colores?: string[];
}) => {
  const descripcion = `${titulo}: ${etiquetas
    .map((e, i) => `${e} ${valores[i].toLocaleString("es-MX")}${sufijo}`)
    .join(", ")}`;

  const opciones: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    layout: { padding: { top: 28 } }, //^ espacio para los números
    scales: { y: { beginAtZero: true } },
  };

  return (
    <Box>
      <Box sx={{ position: "relative", height: 280 }}>
        <Bar
          data={{
            labels: etiquetas,
            datasets: [
              {
                label: titulo,
                data: valores,
                backgroundColor: colores ?? "#0B5CAD",
                borderColor: "#000",
                borderWidth: 2,
              },
            ],
          }}
          options={opciones}
          plugins={[valoresSobreBarras(sufijo)]}
          role="img"
          aria-label={descripcion}
          fallbackContent={<p>{descripcion}</p>}
        />
      </Box>
      <VerComoTabla
        titulo={titulo}
        columnas={[
          { campo: "etiqueta", etiqueta: titulo },
          { campo: "valor", etiqueta: etiquetaValor, numero: true },
        ]}
        filas={etiquetas.map((e, i) => ({
          etiqueta: e,
          valor: `${valores[i].toLocaleString("es-MX")}${sufijo}`,
        }))}
      />
    </Box>
  );
};
