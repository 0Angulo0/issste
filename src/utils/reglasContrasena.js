/**
 * reglasContrasena.js
 * ------------------------------------------------------------------
 * ? Reglas de contraseña segura, compartidas entre navegador y servidor.
 *
 * Está escrito en JavaScript simple (sin dependencias) para que lo usen
 * los dos lados con EXACTAMENTE las mismas reglas:
 *   - src/pages/PrimerAcceso.tsx  -> muestra al tutor qué requisitos cumple
 *   - server/server.js            -> vuelve a revisar antes de guardar
 *
 * El navegador solo AVISA; quien decide es el servidor, porque el código
 * del navegador se puede modificar. Los tipos para TypeScript están en
 * reglasContrasena.d.ts.
 */

export const LONGITUD_MINIMA = 8;

//? Contraseñas (o palabras base) demasiado comunes. Se comparan solo las
//? letras: "Password123!" -> "password" -> rechazada.
const COMUNES = [
  "password",
  "contrasena",
  "qwerty",
  "qwertyuiop",
  "asdfgh",
  "abc",
  "abcdef",
  "admin",
  "administrador",
  "usuario",
  "bienvenido",
  "hola",
  "iloveyou",
  "teamo",
  "issste",
  "mexico",
  "estancia",
  "secreto",
  "clave",
  "letmein",
];

/** Quita acentos y pasa a minúsculas: "Sofía" -> "sofia". */
const normalizar = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * ? Reglas que el navegador puede revisar mientras el tutor escribe.
 * id: identificador; mensaje: llave de traducción (i18nProvider).
 */
export const REGLAS_BASICAS = [
  {
    id: "longitud",
    mensaje: "contrasena.reglas.longitud",
    cumple: (c) => c.length >= LONGITUD_MINIMA,
  },
  {
    id: "mayuscula",
    mensaje: "contrasena.reglas.mayuscula",
    cumple: (c) => /[A-ZÁÉÍÓÚÑ]/.test(c),
  },
  {
    id: "minuscula",
    mensaje: "contrasena.reglas.minuscula",
    cumple: (c) => /[a-záéíóúñ]/.test(c),
  },
  {
    id: "numero",
    mensaje: "contrasena.reglas.numero",
    cumple: (c) => /[0-9]/.test(c),
  },
  {
    id: "especial",
    mensaje: "contrasena.reglas.especial",
    cumple: (c) => /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s]/.test(c),
  },
  {
    id: "espacios",
    mensaje: "contrasena.reglas.espacios",
    cumple: (c) => c.length > 0 && !/\s/.test(c),
  },
  {
    id: "comun",
    mensaje: "contrasena.reglas.comun",
    cumple: (c) => {
      const letras = normalizar(c).replace(/[^a-z]/g, "");
      return letras.length > 0 && !COMUNES.includes(letras);
    },
  },
];

/**
 * ? Formas en que alguien escribe una fecha dentro de una contraseña.
 * "2024-02-15" -> ["2024", "1502", "0215", "150224", "15022024", "20240215"]
 */
const variantesFecha = (fechaISO) => {
  const [a, m, d] = String(fechaISO ?? "").split("-");
  if (!a || !m || !d) return [];
  return [a, d + m, m + d, d + m + a.slice(2), d + m + a, a + m + d];
};

/**
 * ? Revisa que la contraseña no contenga datos personales.
 * SOLO se ejecuta en el servidor: el navegador no recibe estos datos
 * para no exponer información de la familia a quien solo tenga la clave.
 *
 * datos = { nombres: ["Ana López Pérez", "Sofía Martínez López"],
 *           ciudades: ["Ciudad de México"], fechas: ["2024-02-15"] }
 */
export const contieneDatosPersonales = (contrasena, datos) => {
  const texto = normalizar(contrasena);
  const soloAlfanumerico = texto.replace(/[^a-z0-9]/g, "");

  //^ cada palabra de nombres y ciudades con 3 letras o más (evita "de", "la")
  const palabras = [...(datos.nombres ?? []), ...(datos.ciudades ?? [])]
    .flatMap((t) => normalizar(t).split(/[^a-z]+/))
    .filter((p) => p.length >= 3);
  if (palabras.some((p) => texto.includes(p))) return true;

  const fechas = (datos.fechas ?? []).flatMap(variantesFecha);
  return fechas.some((f) => soloAlfanumerico.includes(f));
};

/** Devuelve [{ id, mensaje, cumple }] para pintar la lista de requisitos. */
export const evaluarReglasBasicas = (contrasena) =>
  REGLAS_BASICAS.map((r) => ({
    id: r.id,
    mensaje: r.mensaje,
    cumple: r.cumple(contrasena ?? ""),
  }));

/**
 * ? Validación completa (la usa el servidor).
 * Regresa la lista de ids de reglas que NO se cumplen; vacía = válida.
 */
export const validarContrasena = (contrasena, datos) => {
  const fallas = evaluarReglasBasicas(contrasena)
    .filter((r) => !r.cumple)
    .map((r) => r.id);
  if (contieneDatosPersonales(contrasena, datos)) fallas.push("personales");
  return fallas;
};
