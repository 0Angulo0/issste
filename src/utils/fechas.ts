import { hoyISO } from "./rangosMedicion.js";

/**
 * ? Utilidades de fechas.
 *
 * Las fechas se guardan como texto "AAAA-MM-DD". No usamos new Date("2024-02-15")
 * para mostrarlas porque JavaScript la interpreta en UTC y en México
 * aparecería como el día anterior (14 de febrero).
 */

const partes = (fechaISO: string) => fechaISO.split("-").map(Number);

/** "2024-02-15" -> "15/02/2024" */
export const formatearFecha = (fechaISO?: string | null) => {
  if (!fechaISO) return "";
  const [a, m, d] = partes(fechaISO);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${a}`;
};

/** "2026-10" -> "octubre 2026" */
export const formatearPeriodo = (periodo: string) => {
  const [a, m] = periodo.split("-").map(Number);
  const mes = new Date(Date.UTC(a, m - 1, 15)).toLocaleString("es-MX", {
    month: "long",
    timeZone: "UTC",
  });
  return `${mes} ${a}`;
};

/** Meses cumplidos entre dos fechas "AAAA-MM-DD". */
export const mesesEntre = (desdeISO: string, hastaISO: string) => {
  const [a1, m1, d1] = partes(desdeISO);
  const [a2, m2, d2] = partes(hastaISO);
  let meses = (a2 - a1) * 12 + (m2 - m1);
  if (d2 < d1) meses -= 1; //^ todavía no cumple el mes
  return Math.max(0, meses);
};

//^ fecha de hoy "AAAA-MM-DD" en hora local (vive en el archivo compartido con el servidor)
export { hoyISO as hoy } from "./rangosMedicion.js";

/** Periodo actual "AAAA-MM". */
export const periodoActual = () => hoyISO().slice(0, 7);

/** Edad en meses (con decimales, para graficar) a partir de meses enteros + días. */
export const textoMeses = (meses: number) => {
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  const textoAnios = anios === 1 ? "1 año" : `${anios} años`;
  const textoResto = resto === 1 ? "1 mes" : `${resto} meses`;
  if (anios === 0) return textoResto;
  if (resto === 0) return textoAnios;
  return `${textoAnios} ${textoResto}`;
};

/**
 * Edad en texto, como la muestran los borradores.
 * "2024-02-15" -> "2 años 8 meses" · "1 año" · "7 meses"
 */
export const calcularEdad = (fechaNacimiento?: string | null, al = hoyISO()) =>
  fechaNacimiento ? textoMeses(mesesEntre(fechaNacimiento, al)) : "";
