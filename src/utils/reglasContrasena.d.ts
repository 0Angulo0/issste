//? Tipos de TypeScript para reglasContrasena.js (el archivo es JS para
//? que también lo pueda usar el servidor en Node sin compilar).

export interface ResultadoRegla {
  id: string;
  mensaje: string;
  cumple: boolean;
}

export interface DatosPersonales {
  nombres?: string[];
  ciudades?: string[];
  fechas?: string[];
}

export const LONGITUD_MINIMA: number;
export const REGLAS_BASICAS: {
  id: string;
  mensaje: string;
  cumple: (contrasena: string) => boolean;
}[];
export function evaluarReglasBasicas(contrasena: string): ResultadoRegla[];
export function contieneDatosPersonales(
  contrasena: string,
  datos: DatosPersonales,
): boolean;
export function validarContrasena(
  contrasena: string,
  datos: DatosPersonales,
): string[];
