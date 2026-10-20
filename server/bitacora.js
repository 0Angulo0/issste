/**
 * bitacora.js
 * ------------------------------------------------------------------
 * ? Bitácora de auditoría: quién hizo qué, cuándo y sobre qué registro.
 *
 * Equivale a la colección "log" del ejemplo del profe. Se guarda en la
 * colección "bitacora" de db.json y SOLO la escribe el servidor (nadie
 * puede crear, editar ni borrar registros de bitácora por la API).
 * El administrador la consulta en modo lectura.
 *
 * Cada registro: { id, fecha, usuarioId, nombre, rol, accion, recurso,
 *                  registroId, detalle }
 */

/** Acciones que se registran (la pantalla las traduce con i18n). */
export const ACCIONES = {
  login: "login",
  loginFallido: "login_fallido",
  primerAcceso: "primer_acceso",
  crear: "crear",
  editar: "editar",
  corregir: "corregir",
  darDeBaja: "dar_de_baja",
  restablecer: "restablecer",
};

/**
 * ? Agrega un registro a la bitácora.
 * sesion puede ser null (por ejemplo, un login fallido); entonces se
 * guarda lo que se sepa en "detalle".
 */
export const registrar = (
  db,
  sesion,
  accion,
  recurso,
  registroId = null,
  detalle = "",
) => {
  const siguienteId = Math.max(0, ...db.get("bitacora").map("id").value()) + 1;
  db.get("bitacora")
    .push({
      id: siguienteId,
      fecha: new Date().toISOString(),
      usuarioId: sesion?.id ?? null,
      nombre: sesion?.nombre ?? "",
      rol: sesion?.rol ?? "",
      accion,
      recurso,
      registroId,
      detalle,
    })
    .write();
};

/**
 * ? Middleware: registra automáticamente las escrituras que pasan por
 * json-server (PUT/PATCH/POST) cuando terminan bien.
 * Las rutas propias (alta de infantes, usuarios, restablecer...) registran
 * su propia acción con registrar().
 */
export const middlewareBitacora = (db) => (req, res, next) => {
  if (!["POST", "PUT", "PATCH"].includes(req.method)) return next();
  res.on("finish", () => {
    if (res.statusCode >= 300) return;
    const [recurso, id] = req.path.split("/").filter(Boolean);
    let accion = req.method === "POST" ? ACCIONES.crear : ACCIONES.editar;
    if (recurso === "mediciones" && id) accion = ACCIONES.corregir;
    if (recurso === "usuarios" && req.body?.activo === false)
      accion = ACCIONES.darDeBaja;
    registrar(
      db,
      req.sesion,
      accion,
      recurso,
      id ? Number(id) : null,
      req.detalleBitacora ?? "",
    );
  });
  next();
};
