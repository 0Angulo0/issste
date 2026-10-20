/**
 * server.js
 * ------------------------------------------------------------------
 * Servidor de desarrollo (PROTOTIPO) del Padrón Infantil.
 *
 * Usa json-server (versión 0.17) "como módulo": json-server da la API REST
 * a partir de db.json, y nosotros agregamos antes nuestras rutas y reglas.
 * La lógica vive en funciones separadas para poder llevarla después a
 * Express + MongoDB sin depender de json-server:
 *   seguridad.js   -> contraseñas (bcrypt), sesiones, claves, límite de intentos
 *   permisos.js    -> qué ve y qué hace cada rol
 *   bitacora.js    -> registro de auditoría
 *   indicadores.js -> totales para los paneles
 *   ../src/utils/  -> reglas compartidas con el navegador (contraseñas, rangos, CDC)
 *
 * Rutas propias:
 *   POST /auth/login          inicia sesión (correo o clave PI-)
 *   POST /auth/primer-acceso  crea la contraseña con la clave (PI- familias, AC- personal)
 *   POST /auth/logout         cierra la sesión
 *   POST /auth/restablecer    genera una clave nueva y borra la contraseña
 *   GET  /indicadores         totales del panel, filtrados por rol
 *   POST /infantes            alta de infante + cuenta del tutor
 *   POST /usuarios            alta de personal con clave de activación
 *   POST /mediciones          valida antes de guardar (rangos, fecha, 1 por día)
 *   PATCH /mediciones/:id     corrección (admin) con motivo obligatorio
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
  cerrarSesionesDe,
  estaBloqueado,
  registrarFalla,
  limpiarFallas,
  generarClaveAcceso,
} from "./seguridad.js";
import { alcance, middlewarePermisos, filtrarRespuesta } from "./permisos.js";
import { registrar, middlewareBitacora, ACCIONES } from "./bitacora.js";
import { calcularIndicadores } from "./indicadores.js";
//^ mismas reglas que ve el usuario en el navegador (archivos compartidos)
import { validarContrasena } from "../src/utils/reglasContrasena.js";
import { validarMedicion, hoyISO } from "../src/utils/rangosMedicion.js";

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

/** Siguiente id numérico de una colección. */
const siguienteId = (coleccion) =>
  Math.max(0, ...db.get(coleccion).map("id").value()) + 1;

/** Genera una clave que no exista todavía (se repite si coincide, rarísimo). */
const claveUnica = (prefijo) => {
  let clave;
  do {
    clave = generarClaveAcceso(prefijo);
  } while (
    db.get("tutores").find({ claveAcceso: clave }).value() ||
    db.get("usuarios").find({ claveActivacion: clave }).value()
  );
  return clave;
};

const error = (res, estado, message, extra = {}) =>
  res.status(estado).json({ message, ...extra });

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
    return error(res, 429, "auth.demasiados_intentos");
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

  //? Cuenta válida que todavía no crea su contraseña (tutor o personal
  //? nuevo): la mandamos a "Primer acceso" en lugar de un error genérico.
  if (cuenta && !cuenta.passwordHash) {
    return error(res, 403, "auth.primer_acceso_pendiente");
  }

  if (!cuenta || !correcta) {
    registrarFalla(llaveIntentos);
    registrar(db, null, ACCIONES.loginFallido, "auth", null, texto);
    // Mensaje genérico: no decimos si falló el usuario o la contraseña.
    return error(res, 401, "auth.login_failed");
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
  registrar(db, sesion, ACCIONES.login, "auth");
  res.json({ token, ...sesion });
});

/**
 * ? POST /auth/primer-acceso
 * Cuerpo: { clave, password }
 *
 * Crea la contraseña de una cuenta nueva usando su clave:
 *   - "PI-XXXXXX": familias (la estancia la entrega al dar de alta al infante)
 *   - "AC-XXXXXX": personal (el administrador la entrega al dar de alta al usuario)
 * Solo funciona UNA vez: si la cuenta ya tiene contraseña, se rechaza.
 * Pasos: 1) buscar clave  2) validar reglas  3) bcrypt.hash  4) guardar
 */
server.post("/auth/primer-acceso", async (req, res) => {
  const { clave = "", password = "" } = req.body ?? {};
  const claveNormal = String(clave).trim().toUpperCase();
  const llaveIntentos = `${req.ip}|primer|${claveNormal}`;

  if (estaBloqueado(llaveIntentos)) {
    return error(res, 429, "auth.demasiados_intentos");
  }

  // 1) La clave debe existir y no haberse usado
  const tutor = db.get("tutores").find({ claveAcceso: claveNormal }).value();
  const usuario = db
    .get("usuarios")
    .find((u) => u.claveActivacion === claveNormal && u.activo)
    .value();
  const cuenta = tutor ?? usuario;
  if (!cuenta || cuenta.passwordHash) {
    registrarFalla(llaveIntentos);
    return error(res, 400, "auth.clave_invalida");
  }

  // 2) Reglas de contraseña, incluyendo datos personales
  //^ estos datos nunca se envían al navegador, solo se usan aquí
  let datos = { nombres: [cuenta.nombre], ciudades: [], fechas: [] };
  if (tutor) {
    const hijos = db
      .get("infantes")
      .filter((i) => tutor.infanteIds.includes(i.id))
      .value();
    datos = {
      nombres: [
        tutor.nombre,
        ...hijos.map((h) => `${h.nombre} ${h.apellidos}`),
      ],
      ciudades: [tutor.ciudad],
      fechas: hijos.map((h) => h.fechaNacimiento),
    };
  }
  const fallas = validarContrasena(String(password), datos);
  if (fallas.length > 0) {
    return error(res, 400, "auth.contrasena_insegura", { fallas });
  }

  // 3) y 4) Guardar SOLO el hash, nunca la contraseña
  const passwordHash = await hashearContrasena(String(password));
  if (tutor) {
    db.get("tutores").find({ id: tutor.id }).assign({ passwordHash }).write();
  } else {
    //^ la clave de activación del personal ya no sirve; entrará con su correo
    db.get("usuarios")
      .find({ id: usuario.id })
      .assign({ passwordHash, claveActivacion: null })
      .write();
  }
  limpiarFallas(llaveIntentos);
  registrar(
    db,
    {
      id: cuenta.id,
      nombre: cuenta.nombre,
      rol: tutor ? "tutor" : usuario.rol,
    },
    ACCIONES.primerAcceso,
    tutor ? "tutores" : "usuarios",
    cuenta.id,
  );
  //^ el personal entra con su correo; la familia, con su clave
  res.json({ usuario: tutor ? tutor.claveAcceso : usuario.email });
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
  if (!sesion) return error(res, 401, "auth.session_expired");
  req.sesion = sesion;
  next();
});

//? Campos que SOLO escribe el servidor. Se quitan de cualquier cuerpo que
//? mande el navegador: contraseñas, claves, ids y quién capturó.
const CAMPOS_PROTEGIDOS = [
  "id",
  "passwordHash",
  "claveAcceso",
  "claveActivacion",
  "registradoPor",
  "expediente",
];
server.use((req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    for (const campo of CAMPOS_PROTEGIDOS) delete req.body[campo];
  }
  next();
});

/* ------------------------------------------------------------------
 * Rutas propias con sesión
 * ------------------------------------------------------------------ */

/** GET /indicadores?periodo=AAAA-MM&estanciaId=&region=&entidad= */
server.get("/indicadores", (req, res) => {
  if (req.sesion.rol === "tutor")
    return error(res, 403, "ra.message.access_denied");
  res.json(calcularIndicadores(db, req.sesion, req.query));
});

/**
 * ? POST /auth/restablecer
 * Cuerpo: { tipo: "tutor" | "usuario", cuentaId }
 * (cuentaId y no "id": el servidor borra "id" de todos los cuerpos)
 *
 * Genera una clave nueva, borra la contraseña y cierra las sesiones de esa
 * cuenta. La persona vuelve a crear su contraseña en "Primer acceso".
 *   - tutor:   lo pueden hacer el admin y la estancia de alguno de sus hijos
 *   - usuario: solo el admin
 */
server.post("/auth/restablecer", (req, res) => {
  const { tipo, cuentaId } = req.body ?? {};
  const { rol } = req.sesion;
  const idNumero = Number(cuentaId);

  if (tipo === "tutor") {
    const tutor = db.get("tutores").find({ id: idNumero }).value();
    const permitidos = alcance(db, req.sesion).infantes;
    const suyo =
      tutor &&
      (permitidos === null ||
        tutor.infanteIds.some((i) => permitidos.includes(i)));
    if (!["admin", "estancia"].includes(rol) || !suyo) {
      return error(res, 403, "ra.message.access_denied");
    }
    const clave = claveUnica("PI");
    db.get("tutores")
      .find({ id: idNumero })
      .assign({ claveAcceso: clave, passwordHash: null })
      .write();
    cerrarSesionesDe("tutor", idNumero);
    registrar(db, req.sesion, ACCIONES.restablecer, "tutores", idNumero);
    return res.json({ clave });
  }

  if (tipo === "usuario" && rol === "admin") {
    const usuario = db.get("usuarios").find({ id: idNumero }).value();
    if (!usuario) return error(res, 404, "ra.notification.item_doesnt_exist");
    const clave = claveUnica("AC");
    db.get("usuarios")
      .find({ id: idNumero })
      .assign({ claveActivacion: clave, passwordHash: null })
      .write();
    cerrarSesionesDe(usuario.rol, idNumero);
    registrar(db, req.sesion, ACCIONES.restablecer, "usuarios", idNumero);
    return res.json({ clave });
  }
  return error(res, 403, "ra.message.access_denied");
});

/**
 * ? POST /infantes: alta de un infante.
 *
 * Además del infante, crea la cuenta del padre, madre o tutor con una
 * CLAVE DE ACCESO nueva y SIN contraseña (passwordHash: null). La familia
 * crea su contraseña en "Primer acceso". La respuesta incluye la clave
 * para que la estancia se la entregue.
 */
server.post("/infantes", (req, res) => {
  const { rol, estanciaId: estanciaSesion } = req.sesion;
  if (rol !== "estancia" && rol !== "admin") {
    return error(res, 403, "ra.message.access_denied");
  }
  const b = req.body ?? {};
  const requeridos = [
    "nombre",
    "apellidos",
    "fechaNacimiento",
    "sexo",
    "tutorNombre",
    "tutorCiudad",
  ];
  if (requeridos.some((campo) => !String(b[campo] ?? "").trim())) {
    return error(res, 400, "infantes.errores.faltan_datos");
  }
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(b.fechaNacimiento) ||
    b.fechaNacimiento > hoyISO()
  ) {
    return error(res, 400, "infantes.errores.nacimiento_futuro");
  }
  if (!["F", "M"].includes(b.sexo)) {
    return error(res, 400, "infantes.errores.faltan_datos");
  }
  //^ el personal solo da de alta en SU estancia; el admin elige
  const estanciaId = rol === "estancia" ? estanciaSesion : Number(b.estanciaId);
  if (!db.get("estancias").find({ id: estanciaId }).value()) {
    return error(res, 400, "infantes.errores.faltan_datos");
  }

  const claveAcceso = claveUnica("PI");
  const infanteId = siguienteId("infantes");
  const tutorId = siguienteId("tutores");
  const infante = {
    id: infanteId,
    nombre: String(b.nombre).trim(),
    apellidos: String(b.apellidos).trim(),
    fechaNacimiento: b.fechaNacimiento,
    sexo: b.sexo,
    expediente: `PI-${String(infanteId + 2480).padStart(5, "0")}`, //^ continúa PI-02481...
    estanciaId,
    tutorId,
  };
  db.get("tutores")
    .push({
      id: tutorId,
      nombre: String(b.tutorNombre).trim(),
      claveAcceso,
      passwordHash: null,
      ciudad: String(b.tutorCiudad).trim(),
      infanteIds: [infanteId],
    })
    .write();
  db.get("infantes").push(infante).write();
  registrar(
    db,
    req.sesion,
    ACCIONES.crear,
    "infantes",
    infanteId,
    infante.expediente,
  );

  res.status(201).json({ ...infante, claveAcceso });
});

/**
 * ? POST /usuarios: alta de personal (solo admin).
 * Se crea SIN contraseña y con una clave de activación "AC-XXXXXX" que el
 * administrador entrega; la persona crea su contraseña en "Primer acceso".
 */
const ROLES_PERSONAL = ["admin", "coordinador", "estancia"];
server.post("/usuarios", (req, res) => {
  if (req.sesion.rol !== "admin")
    return error(res, 403, "ra.message.access_denied");
  const b = req.body ?? {};
  const email = String(b.email ?? "")
    .trim()
    .toLowerCase();
  if (
    !String(b.nombre ?? "").trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return error(res, 400, "usuarios.errores.datos");
  }
  if (!ROLES_PERSONAL.includes(b.rol))
    return error(res, 400, "usuarios.errores.datos");
  if (
    db
      .get("usuarios")
      .find((u) => u.email.toLowerCase() === email)
      .value()
  ) {
    return error(res, 409, "usuarios.errores.correo_repetido");
  }

  //? La estancia define la región; el coordinador necesita región.
  const estancia =
    b.rol === "estancia"
      ? db
          .get("estancias")
          .find({ id: Number(b.estanciaId) })
          .value()
      : null;
  if (b.rol === "estancia" && !estancia)
    return error(res, 400, "usuarios.errores.estancia");
  if (b.rol === "coordinador" && !b.region)
    return error(res, 400, "usuarios.errores.region");

  const usuario = {
    id: siguienteId("usuarios"),
    nombre: String(b.nombre).trim(),
    email,
    passwordHash: null,
    claveActivacion: claveUnica("AC"),
    rol: b.rol,
    estanciaId: estancia?.id ?? null,
    region: estancia?.region ?? (b.rol === "coordinador" ? b.region : null),
    activo: true,
  };
  db.get("usuarios").push(usuario).write();
  registrar(
    db,
    req.sesion,
    ACCIONES.crear,
    "usuarios",
    usuario.id,
    usuario.email,
  );
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, ...publico } = usuario;
  res.status(201).json(publico);
});

//? Permisos por rol (permisos.js): a partir de aquí todo pasa por la tabla
//? de permisos, incluidas las validaciones de abajo.
server.use(middlewarePermisos(db));

/** POST /mediciones: valida antes de dejar que json-server guarde. */
server.post("/mediciones", (req, res, next) => {
  const infante = db
    .get("infantes")
    .find({ id: Number(req.body?.infanteId) })
    .value();
  if (!infante) return error(res, 400, "mediciones.errores.infante");
  const errores = validarMedicion(req.body, infante.fechaNacimiento);
  if (errores.length) return error(res, 400, errores[0].mensaje, { errores });

  //? Una medición por infante por día: si ya existe, se corrige (admin)
  //? en lugar de duplicarla.
  const repetida = db
    .get("mediciones")
    .find({ infanteId: infante.id, fecha: req.body.fecha })
    .value();
  if (repetida) return error(res, 409, "mediciones.errores.repetida");

  req.body.infanteId = infante.id;
  for (const campo of ["peso", "talla", "perimetroCefalico"]) {
    req.body[campo] = Number(req.body[campo]); //^ números como números
  }
  req.body.registradoPor = req.sesion.id; //^ quién capturó, lo pone el servidor
  req.detalleBitacora = `infante ${infante.id}`;
  next();
});

/** PATCH /mediciones/:id: corrección del admin con motivo obligatorio. */
server.patch("/mediciones/:id", (req, res, next) => {
  const medicion = db
    .get("mediciones")
    .find({ id: Number(req.params.id) })
    .value();
  const infante =
    medicion && db.get("infantes").find({ id: medicion.infanteId }).value();
  if (!infante) return error(res, 404, "ra.notification.item_doesnt_exist");

  const motivo = String(req.body?.motivo ?? "").trim();
  if (!motivo) return error(res, 400, "correcciones.errores.motivo");
  delete req.body.motivo; //^ el motivo va a la bitácora, no a la medición
  delete req.body.infanteId; //^ una corrección no cambia de infante

  const corregida = { ...medicion, ...req.body };
  const errores = validarMedicion(corregida, infante.fechaNacimiento);
  if (errores.length) return error(res, 400, errores[0].mensaje, { errores });
  for (const campo of ["peso", "talla", "perimetroCefalico"]) {
    if (campo in req.body) req.body[campo] = Number(req.body[campo]);
  }
  req.detalleBitacora = motivo;
  next();
});

/** PATCH /usuarios/:id: el admin no puede darse de baja a sí mismo. */
server.patch("/usuarios/:id", (req, res, next) => {
  const id = Number(req.params.id);
  if (req.body?.activo === false && id === req.sesion.id) {
    return error(res, 400, "usuarios.errores.baja_propia");
  }
  if ("rol" in req.body && !ROLES_PERSONAL.includes(req.body.rol)) {
    return error(res, 400, "usuarios.errores.datos");
  }
  if (req.body?.rol === "estancia" && req.body.estanciaId) {
    //^ la región del personal de estancia sale de su estancia
    const estancia = db
      .get("estancias")
      .find({ id: Number(req.body.estanciaId) })
      .value();
    if (!estancia) return error(res, 400, "usuarios.errores.estancia");
    req.body.region = estancia.region;
  }
  const usuario = db.get("usuarios").find({ id }).value();
  if (
    usuario &&
    (req.body?.activo === false ||
      ("rol" in req.body && req.body.rol !== usuario.rol))
  ) {
    cerrarSesionesDe(usuario.rol, id); //^ baja o cambio de rol: que vuelva a entrar
  }
  next();
});

//? Bitácora automática de las escrituras que llegan a json-server.
server.use(middlewareBitacora(db));

/* ------------------------------------------------------------------
 * Respuestas: filtrar por rol y nunca enviar secretos al navegador
 * ------------------------------------------------------------------ */

function quitarSecretos(dato) {
  if (Array.isArray(dato)) return dato.map(quitarSecretos);
  if (dato && typeof dato === "object") {
    // eslint-disable-next-line no-unused-vars
    const { passwordHash, claveActivacion, ...resto } = dato;
    //^ en lugar del hash, solo si ya tiene contraseña (para "Falta primer acceso")
    if ("passwordHash" in dato) resto.tieneContrasena = !!passwordHash;
    return resto;
  }
  return dato;
}

router.render = (req, res) => {
  //^ quita lo que el rol no puede ver (permisos.js); null = no existe para él
  const datos = filtrarRespuesta(db, req.sesion, req.path, res.locals.data);
  if (datos === null)
    return error(res, 404, "ra.notification.item_doesnt_exist");
  res.jsonp(quitarSecretos(datos));
};

server.use(router);

server.listen(PUERTO, () => {
  console.log(`Servidor del Padrón Infantil en http://localhost:${PUERTO}`);
});
