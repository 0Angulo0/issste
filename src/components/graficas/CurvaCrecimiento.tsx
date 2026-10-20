import "./registrarChart";
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useTranslate } from "react-admin";
import { Box, Typography } from "@mui/material";
import {
  curvaPercentiles,
  INDICADORES,
  type Indicador,
} from "../../utils/nutricion.js";
import type { Infante, MedicionEvaluada } from "../../hooks/useCrecimiento";
import { VerComoTabla } from "../VerComoTabla";
import { formatearFecha, textoMeses } from "../../utils/fechas";

/**
 * ? Curva de crecimiento con las tablas CDC (chart.js).
 *
 * Accesibilidad (hallazgos de la Evidencia 1.1: Yollot y el SNDIF
 * dependían solo del color):
 *   - Cada línea se distingue por TIPO DE TRAZO y FORMA DE PUNTO, no solo por color:
 *       P97 guiones + cuadrado · P50 continua + círculo · P3 punteada + triángulo
 *       infante: línea gruesa + rombo
 *   - Paleta que se distingue con daltonismo (naranja, azul, negro, guinda).
 *   - Leyenda propia en HTML (texto real) y descripción en aria-label.
 *   - "Ver como tabla" con los mismos datos.
 *
 * modoFamilia: versión sencilla para padres (solo "lo esperado" y su hijo).
 */

const ESTILOS = {
  p97: { color: "#C2410C", trazo: [10, 6], punto: "rect" as const },
  p50: { color: "#0B5CAD", trazo: [] as number[], punto: "circle" as const },
  p3: { color: "#000000", trazo: [2, 6], punto: "triangle" as const },
  infante: { color: "#611232", punto: "rectRot" as const },
};

//? valor graficado de una medición para cada indicador (eje y)
const valorY = (indicador: Indicador, m: MedicionEvaluada) =>
  ({
    peso: m.peso,
    talla: m.talla,
    perimetroCefalico: m.perimetroCefalico,
    pesoTalla: m.peso,
    imc: m.evaluacion.imc,
  })[indicador];

//? posición en el eje x: edad en meses o talla en cm (peso para la talla)
const valorX = (indicador: Indicador, m: MedicionEvaluada) =>
  INDICADORES[indicador].eje === "edad" ? m.evaluacion.edadMeses : m.talla;

/** Muestra de línea para la leyenda (igual a la de la gráfica). */
const MuestraLinea = ({
  color,
  trazo,
  punto,
  grueso = false,
}: {
  color: string;
  trazo: number[];
  punto: string;
  grueso?: boolean;
}) => (
  <svg width="60" height="18" aria-hidden="true" style={{ flex: "none" }}>
    <line
      x1="0"
      y1="9"
      x2="60"
      y2="9"
      stroke={color}
      strokeWidth={grueso ? 4 : 3}
      strokeDasharray={trazo.join(" ")}
      strokeLinecap={trazo[0] === 2 ? "round" : "butt"}
    />
    {punto === "rect" && (
      <rect x="25" y="4" width="10" height="10" fill={color} />
    )}
    {punto === "circle" && <circle cx="30" cy="9" r="5" fill={color} />}
    {punto === "triangle" && <path d="M30 3L36 15H24z" fill={color} />}
    {punto === "rectRot" && <path d="M30 1L38 9L30 17L22 9z" fill={color} />}
  </svg>
);

export const CurvaCrecimiento = ({
  indicador,
  infante,
  mediciones,
  modoFamilia = false,
}: {
  indicador: Indicador;
  infante: Infante;
  mediciones: MedicionEvaluada[];
  modoFamilia?: boolean;
}) => {
  const translate = useTranslate();
  const { eje, unidad } = INDICADORES[indicador];
  const nombre = infante.nombre;
  const nombreIndicador = translate(`graficas.indicadores.${indicador}`);

  //^ solo las mediciones que la tabla CDC cubre (ej. IMC desde 24 meses)
  const puntos = mediciones
    .filter((m) => m.evaluacion.resultados[indicador])
    .map((m) => ({
      medicion: m,
      x: +valorX(indicador, m).toFixed(1),
      y: valorY(indicador, m) as number,
      percentil: m.evaluacion.resultados[indicador]!.percentil,
    }));

  //? rango del eje x: alrededor de las mediciones, dentro de lo que cubre la tabla
  const xs = puntos.map((p) => p.x);
  const desde = Math.max(0, Math.floor((xs.length ? Math.min(...xs) : 0) - 3));
  const hasta = Math.ceil((xs.length ? Math.max(...xs) : 36) + 3);
  const curva = curvaPercentiles(
    indicador,
    infante.sexo,
    desde,
    hasta,
    Math.max(0.5, (hasta - desde) / 40),
  );

  if (!curva.length) {
    return <Typography>{translate("graficas.sin_tabla")}</Typography>;
  }

  const linea = (clave: "p3" | "p50" | "p97", etiqueta: string) => ({
    label: etiqueta,
    data: curva.map((p) => ({ x: p.x, y: p[clave] })),
    borderColor: ESTILOS[clave].color,
    backgroundColor: ESTILOS[clave].color,
    borderDash: modoFamilia ? [10, 6] : ESTILOS[clave].trazo,
    borderWidth: 3,
    pointStyle: ESTILOS[clave].punto,
    //^ un marcador cada 8 puntos para que la forma se vea sin saturar
    pointRadius: (ctx: { dataIndex: number }) =>
      !modoFamilia && ctx.dataIndex % 8 === 4 ? 5 : 0,
    pointHoverRadius: 6,
  });

  const datasets = [
    ...(modoFamilia
      ? [
          {
            ...linea("p50", translate("graficas.esperado")),
            borderColor: "#000",
            backgroundColor: "#000",
          },
        ]
      : [
          linea("p97", translate("graficas.p97")),
          linea("p50", translate("graficas.p50")),
          linea("p3", translate("graficas.p3")),
        ]),
    {
      label: nombre,
      data: puntos.map((p) => ({ x: p.x, y: p.y })),
      borderColor: modoFamilia ? "#0B5CAD" : ESTILOS.infante.color,
      backgroundColor: modoFamilia ? "#0B5CAD" : ESTILOS.infante.color,
      borderWidth: 4,
      pointStyle: modoFamilia ? ("circle" as const) : ESTILOS.infante.punto,
      pointRadius: 8,
      pointHoverRadius: 10,
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
    },
  ];

  const tituloX = translate(
    eje === "edad" ? "graficas.eje_edad" : "graficas.eje_talla",
  );
  const tituloY = `${nombreIndicador.split(" para ")[0]} (${unidad})`;

  const opciones: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, //^ sin animaciones: más cómodo para personas sensibles al movimiento
    scales: {
      x: {
        type: "linear",
        min: curva[0].x,
        max: curva.at(-1)!.x,
        title: {
          display: true,
          text: tituloX,
          font: { size: 15, weight: "bold" },
        },
      },
      y: {
        title: {
          display: true,
          text: tituloY,
          font: { size: 15, weight: "bold" },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (c) =>
            `${c.dataset.label}: ${(c.parsed.y ?? 0).toFixed(1)} ${unidad}`,
        },
      },
    },
  };

  //? descripción en texto de lo que muestra la gráfica (lector de pantalla)
  const ultimo = puntos.at(-1);
  const descripcion = ultimo
    ? translate("graficas.descripcion", {
        indicador: nombreIndicador,
        nombre,
        valor: `${ultimo.y.toFixed(1)} ${unidad}`,
        percentil: Math.round(ultimo.percentil),
      })
    : translate("graficas.sin_mediciones");

  //? filas de "Ver como tabla": cada medición contra los percentiles de su edad/talla
  const filas = puntos.map((p) => {
    const ref = curvaPercentiles(indicador, infante.sexo, p.x, p.x)[0];
    return {
      fecha: formatearFecha(p.medicion.fecha),
      edad: textoMeses(Math.floor(p.medicion.evaluacion.edadMeses)),
      x: eje === "talla" ? `${p.x} cm` : undefined,
      valor: `${p.y.toFixed(1)}`,
      p3: ref?.p3.toFixed(1),
      p50: ref?.p50.toFixed(1),
      p97: ref?.p97.toFixed(1),
      percentil: Math.round(p.percentil),
    };
  });
  const columnas = [
    { campo: "fecha", etiqueta: translate("graficas.col_fecha") },
    { campo: "edad", etiqueta: translate("graficas.col_edad") },
    ...(eje === "talla"
      ? [
          {
            campo: "x",
            etiqueta: translate("graficas.eje_talla"),
            numero: true,
          },
        ]
      : []),
    { campo: "valor", etiqueta: `${nombre} (${unidad})`, numero: true },
    ...(modoFamilia
      ? [
          {
            campo: "p50",
            etiqueta: translate("graficas.esperado"),
            numero: true,
          },
        ]
      : [
          { campo: "p3", etiqueta: "P3", numero: true },
          { campo: "p50", etiqueta: "P50", numero: true },
          { campo: "p97", etiqueta: "P97", numero: true },
          {
            campo: "percentil",
            etiqueta: translate("graficas.col_percentil"),
            numero: true,
          },
        ]),
  ];

  return (
    <Box>
      <Box sx={{ position: "relative", height: { xs: 300, md: 380 } }}>
        <Line
          data={{ datasets }}
          options={opciones}
          role="img"
          aria-label={descripcion}
          fallbackContent={<p>{descripcion}</p>}
        />
      </Box>

      {/* Leyenda propia: texto real + la misma forma de línea y punto */}
      <Box
        component="ul"
        aria-label={translate("graficas.leyenda")}
        sx={{
          listStyle: "none",
          p: 0,
          m: "12px 0 0",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 24px",
        }}
      >
        {(modoFamilia
          ? [
              {
                ...ESTILOS.p50,
                color: "#000",
                trazo: [10, 6],
                punto: "ninguno", //^ la línea "lo esperado" no lleva puntos
                texto: translate("graficas.leyenda_esperado"),
              },
            ]
          : [
              { ...ESTILOS.p97, texto: translate("graficas.leyenda_p97") },
              { ...ESTILOS.p50, texto: translate("graficas.leyenda_p50") },
              { ...ESTILOS.p3, texto: translate("graficas.leyenda_p3") },
            ]
        ).map((l) => (
          <Box
            component="li"
            key={l.texto}
            sx={{ display: "flex", gap: 1, alignItems: "center" }}
          >
            <MuestraLinea color={l.color} trazo={l.trazo} punto={l.punto} />
            {l.texto}
          </Box>
        ))}
        <Box
          component="li"
          sx={{ display: "flex", gap: 1, alignItems: "center" }}
        >
          <MuestraLinea
            color={modoFamilia ? "#0B5CAD" : ESTILOS.infante.color}
            trazo={[]}
            punto={modoFamilia ? "circle" : "rectRot"}
            grueso
          />
          {translate(
            modoFamilia ? "graficas.leyenda_hijo" : "graficas.leyenda_infante",
            { nombre },
          )}
        </Box>
      </Box>

      <VerComoTabla
        titulo={`${nombreIndicador} · ${nombre}`}
        columnas={columnas}
        filas={filas}
      />
    </Box>
  );
};
