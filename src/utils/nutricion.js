/**
 * nutricion.js
 * ------------------------------------------------------------------
 * ? Cálculos de crecimiento con las tablas de los CDC (método LMS).
 *
 * Compartido entre navegador (gráficas y textos) y servidor (indicadores
 * de coordinadores y administración), para que ambos clasifiquen igual.
 * Escrito en JavaScript simple; los tipos están en nutricion.d.ts.
 *
 * Método LMS en una frase: para cada edad (o talla) los CDC publican tres
 * números L, M y S. Con ellos:
 *   - el valor en un percentil:  X = M · (1 + L·S·Z)^(1/L)
 *   - el puntaje Z de una medida: Z = ((X/M)^L − 1) / (L·S)
 * y Z se convierte en percentil con la distribución normal.
 */

import { TABLAS_CDC } from "./tablasCDC.js";

/* ------------------------------------------------------------------
 * ? Indicadores que mostramos
 * eje: "edad" (x = meses) o "talla" (x = cm)
 * tablas: qué tabla CDC usar según la edad (antes / desde los 24 meses)
 * ------------------------------------------------------------------ */
export const INDICADORES = {
  peso: { eje: "edad", unidad: "kg", tablas: ["pesoEdadLactante", "pesoEdad"] },
  talla: {
    eje: "edad",
    unidad: "cm",
    tablas: ["tallaEdadLactante", "tallaEdad"],
  },
  perimetroCefalico: {
    eje: "edad",
    unidad: "cm",
    tablas: ["perimetroEdad", null],
  },
  pesoTalla: { eje: "talla", unidad: "kg", tablas: ["pesoTalla", null] },
  imc: { eje: "edad", unidad: "kg/m²", tablas: [null, "imcEdad"] },
};

//? Puntajes Z de los percentiles que usamos
export const Z = {
  p3: -1.880794,
  p5: -1.644854,
  p50: 0,
  p85: 1.036433,
  p95: 1.644854,
  p97: 1.880794,
};

const MESES_POR_DIA = 1 / 30.4375; //^ misma conversión que usan los CDC

/** Edad en meses con decimales entre dos fechas "AAAA-MM-DD". */
export const edadEnMeses = (nacimiento, fecha) => {
  const utc = (iso) => {
    const [a, m, d] = String(iso).split("-").map(Number);
    return Date.UTC(a, m - 1, d);
  };
  return Math.max(0, (utc(fecha) - utc(nacimiento)) / 86400000) * MESES_POR_DIA;
};

/** IMC = peso (kg) / talla (m)². */
export const calcularImc = (peso, tallaCm) =>
  peso && tallaCm ? peso / (tallaCm / 100) ** 2 : null;

/** Elige la tabla CDC del indicador; null si no aplica a esa edad. */
const tablaPara = (indicador, sexo, edadMeses) => {
  const [lactante, mayor] = INDICADORES[indicador].tablas;
  //? Antes de los 24 meses, la tabla de lactantes (medidos acostados).
  //? Desde los 24, la de 2 a 20 años; si el indicador no tiene (perímetro
  //? cefálico, peso para la talla), se sigue con la de lactantes.
  const nombre = edadMeses < 24 ? lactante : (mayor ?? lactante);
  return nombre ? TABLAS_CDC[nombre][sexo] : null;
};

/** L, M y S en x, interpolando entre las dos filas más cercanas. */
const lmsEn = (tabla, x) => {
  if (!tabla?.length || x < tabla[0][0] || x > tabla.at(-1)[0]) return null;
  let i = tabla.findIndex((fila) => fila[0] >= x);
  if (tabla[i][0] === x || i === 0) return tabla[i].slice(1);
  const [x0, ...a] = tabla[i - 1];
  const [x1, ...b] = tabla[i];
  const t = (x - x0) / (x1 - x0);
  return a.map((v, k) => v + (b[k] - v) * t);
};

const valorEnZ = ([L, M, S], z) =>
  L === 0 ? M * Math.exp(S * z) : M * (1 + L * S * z) ** (1 / L);

const zDeValor = ([L, M, S], x) =>
  L === 0 ? Math.log(x / M) / S : ((x / M) ** L - 1) / (L * S);

/** Distribución normal acumulada (aproximación de Abramowitz-Stegun). */
const normalAcumulada = (z) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
};

/**
 * ? Percentil de una medida.
 * x = edad en meses (o talla en cm para pesoTalla). Regresa
 * { z, percentil } o null si la tabla no cubre ese caso.
 */
export const percentilDe = (indicador, sexo, edadMeses, x, valor) => {
  const tabla = tablaPara(indicador, sexo, edadMeses);
  const lms = tabla && lmsEn(tabla, x);
  if (!lms || !valor) return null;
  const z = zDeValor(lms, valor);
  return { z, percentil: normalAcumulada(z) * 100 };
};

/**
 * ? Valor que corresponde a un puntaje Z (ej. z = 0 es la mediana P50).
 * La usa server/semilla.js para generar datos de ejemplo realistas.
 */
export const valorEnPuntajeZ = (indicador, sexo, edadMeses, x, z) => {
  const lms = lmsEn(tablaPara(indicador, sexo, edadMeses), x);
  return lms ? valorEnZ(lms, z) : null;
};

/**
 * ? Curvas P3, P50 y P97 para graficar.
 * Para indicadores por edad, x va de "desde" a "hasta" meses; para
 * pesoTalla, en cm. Regresa [{ x, p3, p50, p97 }].
 */
export const curvaPercentiles = (indicador, sexo, desde, hasta, paso = 1) => {
  const puntos = [];
  for (let x = desde; x <= hasta + 1e-9; x += paso) {
    //^ en pesoTalla la "edad" solo decide la tabla: siempre la de lactantes
    const edad = INDICADORES[indicador].eje === "edad" ? x : 0;
    const lms = lmsEn(tablaPara(indicador, sexo, edad), x);
    if (!lms) continue;
    puntos.push({
      x: +x.toFixed(2),
      p3: +valorEnZ(lms, Z.p3).toFixed(2),
      p50: +valorEnZ(lms, Z.p50).toFixed(2),
      p97: +valorEnZ(lms, Z.p97).toFixed(2),
    });
  }
  return puntos;
};

/**
 * ? Evalúa una medición de un infante.
 * infante: { fechaNacimiento, sexo }
 * medicion: { fecha, peso, talla, perimetroCefalico }
 *
 * Clasificación (criterios de los CDC):
 *   - menos de 24 meses: peso para la talla  (< P3 bajo · > P97 alto)
 *   - 24 meses o más:    IMC para la edad    (< P5 bajo · P85-P95 sobrepeso · ≥ P95 obesidad)
 *   - talla baja:        talla para la edad < P3
 * alerta = estado distinto de "adecuado" o talla baja.
 */
export const evaluarMedicion = (infante, medicion) => {
  const { sexo, fechaNacimiento } = infante;
  const edad = edadEnMeses(fechaNacimiento, medicion.fecha);
  const imc = calcularImc(medicion.peso, medicion.talla);

  const resultados = {
    peso: percentilDe("peso", sexo, edad, edad, medicion.peso),
    talla: percentilDe("talla", sexo, edad, edad, medicion.talla),
    perimetroCefalico: percentilDe(
      "perimetroCefalico",
      sexo,
      edad,
      edad,
      medicion.perimetroCefalico,
    ),
    pesoTalla: percentilDe(
      "pesoTalla",
      sexo,
      edad,
      medicion.talla,
      medicion.peso,
    ),
    imc: percentilDe("imc", sexo, edad, edad, imc),
  };

  let estado = "sin_dato";
  if (edad < 24 && resultados.pesoTalla) {
    const p = resultados.pesoTalla.percentil;
    estado = p < 3 ? "bajo" : p > 97 ? "alto" : "adecuado";
  } else if (edad >= 24 && resultados.imc) {
    const p = resultados.imc.percentil;
    estado =
      p < 5 ? "bajo" : p < 85 ? "adecuado" : p < 95 ? "sobrepeso" : "obesidad";
  }
  const tallaBaja = !!resultados.talla && resultados.talla.percentil < 3;

  return {
    edadMeses: edad,
    imc: imc && +imc.toFixed(1),
    resultados,
    estado,
    tallaBaja,
    alerta: (estado !== "adecuado" && estado !== "sin_dato") || tallaBaja,
  };
};

/** Lista de estados posibles (para tablas y gráficas de distribución). */
export const ESTADOS = [
  "bajo",
  "adecuado",
  "sobrepeso",
  "obesidad",
  "alto",
  "sin_dato",
];
