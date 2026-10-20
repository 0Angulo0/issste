//? Tipos de TypeScript para rangosMedicion.js (el archivo es JS para
//? que también lo pueda usar el servidor en Node sin compilar).

export interface Rango {
  min: number;
  max: number;
  unidad: string;
}

export const RANGOS: {
  peso: Rango;
  talla: Rango;
  perimetroCefalico: Rango;
};
export function hoyISO(): string;
export function validarMedicion(
  medicion: Record<string, unknown>,
  fechaNacimiento?: string,
): { campo: string; mensaje: string }[];
