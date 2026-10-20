/**
 * convertirCDC.js
 * ------------------------------------------------------------------
 * ? Convierte las tablas de crecimiento de los CDC (archivos CSV oficiales)
 * al archivo src/utils/tablasCDC.js que usan navegador y servidor.
 *
 * Fuente: https://www.cdc.gov/growthcharts/percentile_data_files.htm
 * (archivos en server/datos/cdc/). Solo se necesita volver a ejecutar si
 * los CDC publican tablas nuevas:   node server/convertirCDC.js
 *
 * De cada fila se guardan L, M y S (método LMS de los CDC). Con esos tres
 * números se calcula cualquier percentil y el percentil exacto de una
 * medición (ver src/utils/nutricion.js).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const carpeta = path.dirname(fileURLToPath(import.meta.url));
const EDAD_MAXIMA_MESES = 73; //^ las EBDI atienden de 0 a 6 años

//? archivo CSV -> nombre de la tabla en tablasCDC.js
const ARCHIVOS = {
  wtageinf: "pesoEdadLactante", //^ peso para la edad, 0 a 36 meses
  lenageinf: "tallaEdadLactante", //^ longitud (acostado) para la edad, 0 a 36 meses
  hcageinf: "perimetroEdad", //^ perímetro cefálico para la edad, 0 a 36 meses
  wtleninf: "pesoTalla", //^ peso para la longitud, 45 a 103.5 cm
  wtage: "pesoEdad", //^ peso para la edad, 2 a 20 años
  statage: "tallaEdad", //^ estatura (de pie) para la edad, 2 a 20 años
  bmiagerev: "imcEdad", //^ IMC para la edad, 2 a 20 años
};

const tablas = {};
for (const [archivo, nombre] of Object.entries(ARCHIVOS)) {
  const lineas = fs
    .readFileSync(path.join(carpeta, "datos/cdc", `${archivo}.csv`), "utf8")
    .replace(/^﻿/, "") //^ algunos archivos traen BOM al inicio
    .trim()
    .split(/\r?\n/)
    .filter((l) => /^[12],/.test(l)); //^ solo filas de datos (hay encabezados repetidos)
  const tabla = { M: [], F: [] }; //^ en los CDC: 1 = niño (M), 2 = niña (F)
  for (const linea of lineas) {
    const [sexo, x, L, M, S] = linea.split(",").map(Number);
    if (archivo !== "wtleninf" && x > EDAD_MAXIMA_MESES) continue;
    tabla[sexo === 1 ? "M" : "F"].push([x, L, M, S].map((n) => +n.toFixed(6)));
  }
  tablas[nombre] = tabla;
}

const contenido = `/**
 * tablasCDC.js · ARCHIVO GENERADO por server/convertirCDC.js. No editar a mano.
 * Tablas de crecimiento de los CDC (método LMS). Cada fila: [x, L, M, S]
 * donde x es la edad en meses (o la longitud en cm en pesoTalla).
 * Fuente: https://www.cdc.gov/growthcharts/percentile_data_files.htm
 */
export const TABLAS_CDC = ${JSON.stringify(tablas)};
`;
fs.writeFileSync(path.join(carpeta, "../src/utils/tablasCDC.js"), contenido);
console.log("src/utils/tablasCDC.js generado.");
