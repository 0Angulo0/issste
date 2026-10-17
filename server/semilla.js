/**
 * semilla.js
 * ------------------------------------------------------------------
 * Genera server/db.json con datos de EJEMPLO para desarrollo.
 *
 * Las contraseñas de prueba se guardan ya convertidas a hash con bcrypt,
 * igual que se guardarían en producción. Nunca se escribe una contraseña
 * en texto plano dentro de db.json.
 *
 * Cómo ejecutarlo:  npm run semilla
 * ¡Cuidado! Sobrescribe db.json y se pierden los cambios hechos desde la app.
 *
 * Cuentas de prueba (todas con la contraseña "Padron#2026"):
 *   admin@issste.gob.mx              -> Administrador
 *   coordinador.centro@issste.gob.mx -> Coordinador regional (Centro)
 *   personal.ebdi35@issste.gob.mx    -> Personal de estancia (EBDI 35)
 *   PI-7K3M9Q                        -> Tutor de Sofía
 *   PI-4H8R2T                        -> Tutor SIN contraseña (para probar
 *                                       el primer acceso)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashearContrasena } from "./seguridad.js";

const carpeta = path.dirname(fileURLToPath(import.meta.url));
const CONTRASENA_PRUEBA = "Padron#2026";

const hash = await hashearContrasena(CONTRASENA_PRUEBA);

const estancias = [
  { id: 35, numero: "35", nombre: "EBDI 35 Coyoacán", tipo: "Propia", estado: "Ciudad de México", region: "Centro" },
  { id: 12, numero: "12", nombre: "EBDI 12 Tlalpan", tipo: "Propia", estado: "Ciudad de México", region: "Centro" },
  { id: 41, numero: "41", nombre: "EBDI 41 Iztapalapa", tipo: "Contratada", estado: "Ciudad de México", region: "Centro" },
  { id: 7, numero: "07", nombre: "EBDI 07 Benito Juárez", tipo: "Propia", estado: "Ciudad de México", region: "Centro" },
  { id: 52, numero: "52", nombre: "EBDI 52 Xochimilco", tipo: "OSC", estado: "Ciudad de México", region: "Centro" },
  { id: 3, numero: "03", nombre: "EBDI 03 Monterrey", tipo: "Propia", estado: "Nuevo León", region: "Norte" },
  { id: 20, numero: "20", nombre: "EBDI 20 Guadalajara", tipo: "Contratada", estado: "Jalisco", region: "Occidente" },
];

const usuarios = [
  { id: 1, nombre: "Patricia Ramírez Díaz", email: "admin@issste.gob.mx", passwordHash: hash, rol: "admin", estanciaId: null, region: null, activo: true },
  { id: 2, nombre: "Miguel Ángel Torres", email: "coordinador.centro@issste.gob.mx", passwordHash: hash, rol: "coordinador", estanciaId: null, region: "Centro", activo: true },
  { id: 3, nombre: "Laura Hernández Ruiz", email: "personal.ebdi35@issste.gob.mx", passwordHash: hash, rol: "estancia", estanciaId: 35, region: "Centro", activo: true },
  { id: 4, nombre: "Patricia Soto Vega", email: "personal.ebdi41@issste.gob.mx", passwordHash: hash, rol: "estancia", estanciaId: 41, region: "Centro", activo: false },
];

// passwordHash: null significa que el tutor todavía no hace su primer acceso.
const tutores = [
  { id: 1, nombre: "Ana López Pérez", claveAcceso: "PI-7K3M9Q", passwordHash: hash, ciudad: "Ciudad de México", infanteIds: [1] },
  { id: 2, nombre: "Jorge Castillo Mora", claveAcceso: "PI-4H8R2T", passwordHash: null, ciudad: "Ciudad de México", infanteIds: [2] },
];

const infantes = [
  { id: 1, nombre: "Sofía", apellidos: "Martínez López", fechaNacimiento: "2024-02-15", sexo: "F", expediente: "PI-02481", estanciaId: 35, tutorId: 1 },
  { id: 2, nombre: "Mateo", apellidos: "Castillo Ruiz", fechaNacimiento: "2023-08-03", sexo: "M", expediente: "PI-02482", estanciaId: 35, tutorId: 2 },
  { id: 3, nombre: "Valentina", apellidos: "Gómez Silva", fechaNacimiento: "2024-11-20", sexo: "F", expediente: "PI-02483", estanciaId: 12, tutorId: null },
  { id: 4, nombre: "Diego", apellidos: "Hernández Paz", fechaNacimiento: "2023-05-10", sexo: "M", expediente: "PI-02484", estanciaId: 41, tutorId: null },
  { id: 5, nombre: "Camila", apellidos: "Reyes Luna", fechaNacimiento: "2024-06-01", sexo: "F", expediente: "PI-02485", estanciaId: 3, tutorId: null },
];

const mediciones = [
  { id: 1, infanteId: 1, fecha: "2025-02-15", peso: 11.6, talla: 74.5, perimetroCefalico: 44.5, registradoPor: 3 },
  { id: 2, infanteId: 1, fecha: "2025-08-15", peso: 12.6, talla: 80.5, perimetroCefalico: 46.5, registradoPor: 3 },
  { id: 3, infanteId: 1, fecha: "2026-02-16", peso: 13.4, talla: 85.5, perimetroCefalico: 47.8, registradoPor: 3 },
  { id: 4, infanteId: 1, fecha: "2026-09-30", peso: 14.4, talla: 91.4, perimetroCefalico: 49.2, registradoPor: 3 },
  { id: 5, infanteId: 2, fecha: "2026-03-03", peso: 14.1, talla: 92.0, perimetroCefalico: 49.0, registradoPor: 3 },
  { id: 6, infanteId: 2, fecha: "2026-09-29", peso: 15.0, talla: 96.2, perimetroCefalico: 49.6, registradoPor: 3 },
  { id: 7, infanteId: 3, fecha: "2026-09-30", peso: 9.1, talla: 75.0, perimetroCefalico: 45.1, registradoPor: null },
  { id: 8, infanteId: 4, fecha: "2026-09-24", peso: 15.8, talla: 99.5, perimetroCefalico: 50.1, registradoPor: 4 },
];

// VALORES DE EJEMPLO tomados del borrador de diseño (peso, niñas).
// TODO (Pantalla 3): reemplazar por las tablas oficiales de los CDC.
const percentiles = [
  [12, 10.2, 12.0, 14.6],
  [18, 10.8, 12.7, 15.3],
  [24, 11.4, 13.6, 16.0],
  [30, 12.1, 14.5, 16.9],
  [36, 12.9, 15.3, 17.7],
  [42, 13.6, 16.0, 18.3],
].map(([edadMeses, p3, p50, p97], i) => ({
  id: i + 1,
  sexo: "F",
  indicador: "peso",
  edadMeses,
  p3,
  p50,
  p97,
}));

const db = { usuarios, tutores, estancias, infantes, mediciones, percentiles };

fs.writeFileSync(path.join(carpeta, "db.json"), JSON.stringify(db, null, 2));
console.log("db.json generado con datos de ejemplo.");
