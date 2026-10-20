//? Tipos de TypeScript para nutricion.js (el archivo es JS para que también
//? lo use el servidor en Node sin compilar).

export type Indicador =
  "peso" | "talla" | "perimetroCefalico" | "pesoTalla" | "imc";
export type Sexo = "F" | "M";
export type Estado =
  "bajo" | "adecuado" | "sobrepeso" | "obesidad" | "alto" | "sin_dato";

export interface Percentil {
  z: number;
  percentil: number;
}

export interface PuntoCurva {
  x: number;
  p3: number;
  p50: number;
  p97: number;
}

export interface Evaluacion {
  edadMeses: number;
  imc: number | null;
  resultados: Record<Indicador, Percentil | null>;
  estado: Estado;
  tallaBaja: boolean;
  alerta: boolean;
}

export const INDICADORES: Record<
  Indicador,
  { eje: "edad" | "talla"; unidad: string; tablas: (string | null)[] }
>;
export const Z: Record<"p3" | "p5" | "p50" | "p85" | "p95" | "p97", number>;
export const ESTADOS: Estado[];
export function edadEnMeses(nacimiento: string, fecha: string): number;
export function calcularImc(peso: number, tallaCm: number): number | null;
export function percentilDe(
  indicador: Indicador,
  sexo: Sexo,
  edadMeses: number,
  x: number,
  valor: number,
): Percentil | null;
export function valorEnPuntajeZ(
  indicador: Indicador,
  sexo: Sexo,
  edadMeses: number,
  x: number,
  z: number,
): number | null;
export function curvaPercentiles(
  indicador: Indicador,
  sexo: Sexo,
  desde: number,
  hasta: number,
  paso?: number,
): PuntoCurva[];
export function evaluarMedicion(
  infante: { fechaNacimiento: string; sexo: Sexo },
  medicion: {
    fecha: string;
    peso: number;
    talla: number;
    perimetroCefalico?: number;
  },
): Evaluacion;
