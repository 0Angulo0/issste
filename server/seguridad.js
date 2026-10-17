/**
 * seguridad.js
 * ------------------------------------------------------------------
 * Funciones de seguridad del servidor del Padrón Infantil.
 *
 * Aquí vive TODO lo relacionado con contraseñas y sesiones, para que
 * el resto del servidor no tenga que saber cómo funciona bcrypt.
 * La explicación completa está en server/README_SEGURIDAD.md.
 *
 * IMPORTANTE: este archivo solo se ejecuta en el servidor (Node.js).
 * Nunca se importa desde el navegador (carpeta src/).
 */

import bcrypt from "bcrypt";
import crypto from "node:crypto";

/**
 * ? Número de "rondas" (cost factor) de bcrypt.
 *
 * bcrypt repite su cálculo 2^RONDAS veces. Con 12 rondas son 4,096
 * repeticiones. Si en el futuro las computadoras son más rápidas, habrá
 * que subir este número; los hashes viejos siguen funcionando porque cada hash
 * guarda dentro de sí con cuántas rondas se generó.
 */
export const RONDAS_BCRYPT = 12;

/**
 * ? Convierte una contraseña en texto plano a un hash de bcrypt.
 *
 * bcrypt genera automáticamente un "salt" (valor aleatorio) distinto
 * para cada contraseña, así dos tutores con la misma contraseña tendrán
 * hashes completamente diferentes. Toma la contraseña escrita por el usuario
 * y regresa el hash que se guardara en la db
 */
export async function hashearContrasena(contrasena) {
  return bcrypt.hash(contrasena, RONDAS_BCRYPT);
}

/**
 * ? Compara una contraseña escrita por el usuario contra el hash guardado.
 *
 * bcrypt toma el salt que viene dentro del hash, vuelve a calcular el hash 
 * de la contraseña y revisa si ambos coinciden.
 */
export async function compararContrasena(contrasena, hash) {
  if (!hash) return false; //^ cuenta sin contraseña (tutor sin primer acceso)
  return bcrypt.compare(contrasena, hash);
}

/**
 * ? Sesiones activas, guardadas en memoria: token -> datos del usuario.
 *
 * Al iniciar sesión se genera un token aleatorio que el navegador manda
 * en cada petición (encabezado "Authorization: Bearer <token>").
 * Como viven en memoria, al reiniciar el servidor todos deben volver a
 * iniciar sesión. Para producción se recomienda guardarlas en una base
 * de datos o usar JWT firmados.
 */
const sesiones = new Map();

/**
 * Crea una sesión nueva y devuelve su token.
 * @param {{id: number|string, rol: string}} datos
 * @returns {string} token aleatorio de 64 caracteres
 */
export function crearSesion(datos) {
  const token = crypto.randomBytes(32).toString("hex");
  sesiones.set(token, datos);
  return token;
}

/** Devuelve los datos de la sesión o undefined si el token no existe. */
export function obtenerSesion(token) {
  return sesiones.get(token);
}

/** Elimina una sesión (cerrar sesión). */
export function cerrarSesion(token) {
  sesiones.delete(token);
}

/**
 * ? Genera una clave de acceso para tutores, por ejemplo "PI-7K3M9Q".
 * Se omiten letras y números que se confunden al dictarlos (0/O, 1/I/L).
 */
export function generarClaveAcceso() {
  const alfabeto = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let clave = "";
  for (let i = 0; i < 6; i++) {
    clave += alfabeto[crypto.randomInt(alfabeto.length)];
  }
  return `PI-${clave}`;
}
