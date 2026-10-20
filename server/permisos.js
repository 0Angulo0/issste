/**
 * permisos.js
 * ------------------------------------------------------------------
 * ? Qué puede ver y hacer cada rol en la API.
 *
 * Ocultar un botón en la pantalla NO es seguridad: cualquiera puede llamar
 * la API directamente. Por eso el servidor decide, con la sesión de quien
 * hace la petición (req.sesion), qué datos entrega.
 *
 * Idea central: el "alcance" de una sesión = qué infantes y qué estancias
 * le corresponden. Todo lo demás se deriva de ahí:
 *   - admin:       todo
 *   - coordinador: estancias de SU región y sus infantes
 *   - estancia:    SU estancia y sus infantes
 *   - tutor:       SUS hijos y las estancias de sus hijos
 *
 * Dos mecanismos:
 *   1. middlewarePermisos (antes de json-server): rechaza lo no permitido
 *      (403) y agrega filtros a la consulta (?id=1&id=2) para que json-server
 *      solo busque dentro del alcance.
 *   2. filtrarRespuesta (después de json-server): red de seguridad que quita
 *      de la respuesta cualquier registro fuera del alcance.
 */

/** "/infantes/3" -> { coleccion: "infantes", id: "3" } */
export const leerRuta = (ruta) => {
  const [coleccion, id] = ruta.split("?")[0].split("/").filter(Boolean);
  return { coleccion, id };
};

/**
 * ? Alcance de una sesión.
 * Regresa { infantes, estancias } como listas de ids, o null = sin límite.
 */
export const alcance = (db, sesion) => {
  const { rol } = sesion;
  if (rol === "admin") return { infantes: null, estancias: null };

  let estancias;
  if (rol === "estancia") estancias = [sesion.estanciaId];
  if (rol === "coordinador") {
    estancias = db
      .get("estancias")
      .filter((e) => e.region === sesion.region)
      .map("id")
      .value();
  }
  if (rol === "tutor") {
    const tutor = db.get("tutores").find({ id: sesion.id }).value();
    const infantes = tutor?.infanteIds ?? [];
    estancias = db
      .get("infantes")
      .filter((i) => infantes.includes(i.id))
      .map("estanciaId")
      .uniq()
      .value();
    return { infantes, estancias };
  }
  const infantes = db
    .get("infantes")
    .filter((i) => estancias.includes(i.estanciaId))
    .map("id")
    .value();
  return { infantes, estancias };
};

/* ------------------------------------------------------------------
 * ? Tabla de permisos
 * Para cada colección: qué roles pueden LEER, qué roles pueden ESCRIBIR
 * (POST = crear, PATCH = editar) y con qué campo se filtra por alcance.
 * DELETE no se permite a nadie: los expedientes no se borran; las
 * personas se "dan de baja" (activo: false).
 * ------------------------------------------------------------------ */
const PERMISOS = {
  infantes: {
    leer: ["admin", "coordinador", "estancia", "tutor"],
    crear: ["admin", "estancia"], //^ por la ruta propia POST /infantes
    editar: ["admin", "estancia"],
    campo: "id",
    lista: "infantes",
  },
  mediciones: {
    leer: ["admin", "coordinador", "estancia", "tutor"],
    crear: ["estancia"], //^ el personal captura
    editar: ["admin"], //^ solo el admin corrige ("Correcciones de registro")
    campo: "infanteId",
    lista: "infantes",
  },
  estancias: {
    leer: ["admin", "coordinador", "estancia", "tutor"],
    crear: [],
    editar: ["admin"],
    campo: "id",
    lista: "estancias",
  },
  tutores: {
    leer: ["admin", "estancia"], //^ para ver la clave de acceso de la familia
    crear: [],
    editar: ["admin"],
    campo: null, //^ se filtra en la respuesta (por infanteIds)
  },
  usuarios: {
    leer: ["admin"],
    crear: ["admin"],
    editar: ["admin"],
    campo: null,
  },
  bitacora: { leer: ["admin"], crear: [], editar: [], campo: null },
};

const prohibido = (res) =>
  res.status(403).json({ message: "ra.message.access_denied" });
const noEncontrado = (res) =>
  res.status(404).json({ message: "ra.notification.item_doesnt_exist" });

/** Middleware principal (va después de verificar la sesión). */
export const middlewarePermisos = (db) => (req, res, next) => {
  const { coleccion, id } = leerRuta(req.path);
  const reglas = PERMISOS[coleccion];
  const { rol } = req.sesion;
  if (!reglas) return noEncontrado(res);

  //? PUT reemplaza el registro completo y borraría campos que el navegador
  //? nunca recibe (como passwordHash). Lo tratamos como PATCH (solo cambia
  //? los campos enviados).
  if (req.method === "PUT") req.method = "PATCH";

  const accion = {
    GET: "leer",
    POST: "crear",
    PATCH: "editar",
  }[req.method];
  if (!accion || !reglas[accion].includes(rol)) return prohibido(res);

  const permitidos = alcance(db, req.sesion)[reglas.lista];
  if (!reglas.campo || permitidos === null) return next();

  //? El personal de estancia edita datos del infante, pero no puede
  //? "mudarlo" a otra estancia ni cambiarle el tutor (eso es del admin).
  if (rol === "estancia" && coleccion === "infantes" && req.body) {
    delete req.body.estanciaId;
    delete req.body.tutorId;
  }

  if (id) {
    //^ un registro: debe estar dentro del alcance
    const registro = db
      .get(coleccion)
      .find({ id: Number(id) })
      .value();
    if (!registro) return noEncontrado(res);
    const valor = reglas.campo === "id" ? registro.id : registro[reglas.campo];
    if (!permitidos.includes(valor)) return noEncontrado(res);
    return next();
  }

  if (req.method === "POST") {
    //^ crear: el registro nuevo también debe caer dentro del alcance
    if (!permitidos.includes(Number(req.body?.[reglas.campo]))) {
      return prohibido(res);
    }
    return next();
  }

  //? Listas: si piden ciertos ids se dejan solo los permitidos; si no piden
  //? ninguno, se limita a todos los permitidos. "-1" no existe: así una
  //? lista vacía no regresa todo.
  const pedidos = [req.query[reglas.campo] ?? []].flat().map(Number);
  const finales = pedidos.length
    ? pedidos.filter((n) => permitidos.includes(n))
    : permitidos;
  req.query[reglas.campo] = finales.length ? finales.map(String) : ["-1"];
  next();
};

/**
 * ? Red de seguridad sobre la respuesta de json-server.
 * Quita registros fuera del alcance. Regresa null si se pidió UN registro
 * que el rol no puede ver (el servidor responde 404).
 */
export const filtrarRespuesta = (db, sesion, ruta, datos) => {
  if (!sesion || sesion.rol === "admin") return datos;
  const { coleccion } = leerRuta(ruta);
  const { infantes, estancias } = alcance(db, sesion);

  const visible = {
    infantes: (r) => infantes.includes(r.id),
    mediciones: (r) => infantes.includes(r.infanteId),
    estancias: (r) => estancias.includes(r.id),
    tutores: (r) => (r.infanteIds ?? []).some((i) => infantes.includes(i)),
  }[coleccion];

  if (!visible) return datos;
  if (Array.isArray(datos)) return datos.filter(visible);
  return datos && typeof datos === "object" && !visible(datos) ? null : datos;
};
