/**
 * server.js
 * ------------------------------------------------------------------
 * Servidor de desarrollo del Padrón Infantil.
 *
 * Usa json-server (versión 0.17) "como módulo": json-server nos da la API
 * REST completa a partir de db.json (GET/POST/PUT/DELETE de cada colección),
 * y nosotros le agregamos antes nuestras propias rutas y reglas:
 *
 *   POST /auth/login   -> inicia sesión (compara contraseña con bcrypt)
 *   POST /auth/logout  -> cierra la sesión
 *   Todo lo demás      -> requiere token de sesión válido
 *
 * Además, ninguna respuesta incluye el campo "passwordHash".
 *
 * Cómo ejecutarlo:  npm run server   (escucha en http://localhost:3000)
 */

import jsonServer from "json-server";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  compararContrasena,
  hashearContrasena,
  crearSesion,
  obtenerSesion,
  cerrarSesion,
  estaBloqueado,
  registrarFalla,
  limpiarFallas,
} from "./seguridad.js";
//^ mismas reglas que ve el tutor en el navegador (archivo compartido)
import { validarContrasena } from "../src/utils/reglasContrasena.js";

const PUERTO = 3000;
const carpeta = path.dirname(fileURLToPath(import.meta.url));

const server = jsonServer.create();
const router = jsonServer.router(path.join(carpeta, "db.json"));
// router.db es la base de datos (lowdb) que json-server lee y escribe.
const db = router.db;

// Middlewares por defecto de json-server: CORS, logs, archivos estáticos.
server.use(jsonServer.defaults());
// Permite leer el cuerpo JSON de las peticiones (req.body).
server.use(jsonServer.bodyParser);

/* ------------------------------------------------------------------
 * Rutas de autenticación (no requieren sesión)
 * ------------------------------------------------------------------ */

/**
 * POST /auth/login
 * Cuerpo: { usuario, password }
 *   - Personal (admin, coordinador, estancia): usuario = correo
 *   - Tutores: usuario = clave de acceso (ej. PI-7K3M9Q)
 */
server.post("/auth/login", async (req, res) => {
  const { usuario = "", password = "" } = req.body ?? {};
  const texto = String(usuario).trim();
  const llaveIntentos = `${req.ip}|${texto.toLowerCase()}`;

  if (estaBloqueado(llaveIntentos)) {
    return res.status(429).json({ message: "auth.demasiados_intentos" });
  }

  let cuenta;
  if (texto.includes("@")) {
    cuenta = db
      .get("usuarios")
      .find((u) => u.email.toLowerCase() === texto.toLowerCase() && u.activo)
      .value();
  } else {
    const tutor = db
      .get("tutores")
      .find((t) => t.claveAcceso === texto.toUpperCase())
      .value();
    if (tutor) cuenta = { ...tutor, rol: "tutor" };
  }

  // Siempre ejecutamos bcrypt aunque la cuenta no exista, para que el
  // tiempo de respuesta no revele si un correo o clave está registrado.
  const hash = cuenta?.passwordHash ?? null;
  const correcta = await compararContrasena(String(password), hash);

  //? Tutor con clave válida que todavía no crea su contraseña:
  //? lo mandamos a "Primer acceso" en lugar de un error genérico.
  if (cuenta?.rol === "tutor" && !cuenta.passwordHash) {
    return res.status(403).json({ message: "auth.primer_acceso_pendiente" });
  }

  if (!cuenta || !correcta) {
    registrarFalla(llaveIntentos);
    // Mensaje genérico: no decimos si falló el usuario o la contraseña.
    return res.status(401).json({ message: "auth.login_failed" });
  }
  limpiarFallas(llaveIntentos);

  const sesion = {
    id: cuenta.id,
    rol: cuenta.rol,
    nombre: cuenta.nombre,
    estanciaId: cuenta.estanciaId ?? null,
    region: cuenta.region ?? null,
  };
  const token = crearSesion(sesion);
  res.json({ token, ...sesion });
});

/**
 * ? POST /auth/primer-acceso
 * Cuerpo: { clave, password }
 *
 * El tutor crea su contraseña usando la clave que le dio la estancia.
 * Solo funciona UNA vez: si la clave ya tiene contraseña, se rechaza.
 * Pasos: 1) buscar clave  2) validar reglas  3) bcrypt.hash  4) guardar
 */
server.post("/auth/primer-acceso", async (req, res) => {
  const { clave = "", password = "" } = req.body ?? {};
  const claveNormal = String(clave).trim().toUpperCase();
  const llaveIntentos = `${req.ip}|primer|${claveNormal}`;

  if (estaBloqueado(llaveIntentos)) {
    return res.status(429).json({ message: "auth.demasiados_intentos" });
  }

  // 1) La clave debe existir y no haberse usado
  const tutor = db.get("tutores").find({ claveAcceso: claveNormal }).value();
  if (!tutor || tutor.passwordHash) {
    registrarFalla(llaveIntentos);
    return res.status(400).json({ message: "auth.clave_invalida" });
  }

  // 2) Reglas de contraseña, incluyendo datos personales de la familia
  //^ estos datos nunca se envían al navegador, solo se usan aquí
  const hijos = db
    .get("infantes")
    .filter((i) => tutor.infanteIds.includes(i.id))
    .value();
  const fallas = validarContrasena(String(password), {
    nombres: [tutor.nombre, ...hijos.map((h) => `${h.nombre} ${h.apellidos}`)],
    ciudades: [tutor.ciudad],
    fechas: hijos.map((h) => h.fechaNacimiento),
  });
  if (fallas.length > 0) {
    return res
      .status(400)
      .json({ message: "auth.contrasena_insegura", fallas });
  }

  // 3) y 4) Guardar SOLO el hash, nunca la contraseña
  const passwordHash = await hashearContrasena(String(password));
  db.get("tutores").find({ id: tutor.id }).assign({ passwordHash }).write();
  limpiarFallas(llaveIntentos);
  res.status(204).end();
});

/** POST /auth/logout: elimina la sesión del token enviado. */
server.post("/auth/logout", (req, res) => {
  cerrarSesion(leerToken(req));
  res.status(204).end();
});

/* ------------------------------------------------------------------
 * A partir de aquí todas las rutas requieren sesión
 * ------------------------------------------------------------------ */

function leerToken(req) {
  const encabezado = req.headers.authorization ?? "";
  return encabezado.startsWith("Bearer ") ? encabezado.slice(7) : "";
}

server.use((req, res, next) => {
  const sesion = obtenerSesion(leerToken(req));
  if (!sesion) {
    return res.status(401).json({ message: "auth.session_expired" });
  }
  // Guardamos la sesión para que las reglas por rol (que se irán
  // agregando pantalla por pantalla) sepan quién hace la petición.
  req.sesion = sesion;
  next();
});

//? Nadie puede escribir un passwordHash por la API general (PUT/PATCH/POST
//? /usuarios, /tutores...). Las contraseñas solo cambian por /auth/*.
server.use((req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    delete req.body.passwordHash;
  }
  next();
});

/* ------------------------------------------------------------------
 * Respuestas: nunca enviar hashes de contraseña al navegador
 * ------------------------------------------------------------------ */

function quitarHashes(dato) {
  if (Array.isArray(dato)) return dato.map(quitarHashes);
  if (dato && typeof dato === "object") {
    // eslint-disable-next-line no-unused-vars
    const { passwordHash, ...resto } = dato;
    return resto;
  }
  return dato;
}

router.render = (req, res) => {
  res.jsonp(quitarHashes(res.locals.data));
};

server.use(router);

server.listen(PUERTO, () => {
  console.log(`Servidor del Padrón Infantil en http://localhost:${PUERTO}`);
});
