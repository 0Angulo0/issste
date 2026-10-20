import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
} from "chart.js";

/**
 * ? chart.js solo incluye las piezas que se registran (así pesa menos).
 * Se importa una vez desde cada gráfica. No registramos la leyenda de
 * chart.js: usamos una leyenda propia en HTML, que sí lee el lector de pantalla.
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
);

//? Fuente y tamaño legibles en ejes y etiquetas (mínimo 14px)
ChartJS.defaults.font.size = 14;
ChartJS.defaults.color = "#1A1A1A";
