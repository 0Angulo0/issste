import { RANGOS } from "./rangosMedicion.js";
import { hoy } from "./fechas";

/**
 * ? Validaciones de los formularios de medidas (captura y corrección).
 * Regresan una llave de traducción (o { message, args }) cuando hay error,
 * como pide react-admin. El servidor revisa lo mismo (rangosMedicion.js).
 */

type Campo = keyof typeof RANGOS;

/** El número debe estar en el rango de src/utils/rangosMedicion.js. */
export const enRango = (campo: Campo) => (valor: number | null) => {
  if (valor === null || valor === undefined) return undefined; //^ lo cubre required()
  const { min, max, unidad } = RANGOS[campo];
  return valor < min || valor > max
    ? { message: "mediciones.errores.rango_campo", args: { min, max, unidad } }
    : undefined;
};

/** La fecha no puede ser posterior a hoy. */
export const noFutura = (valor: string) =>
  valor && valor > hoy() ? "mediciones.errores.futura" : undefined;

/** La fecha no puede ser anterior al nacimiento. */
export const despuesDe = (fechaNacimiento?: string) => (valor: string) =>
  valor && fechaNacimiento && valor < fechaNacimiento
    ? "mediciones.errores.antes_nacimiento"
    : undefined;
