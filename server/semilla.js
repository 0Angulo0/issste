/**
 * semilla.js
 * ------------------------------------------------------------------
 * Genera server/db.json con datos de EJEMPLO para desarrollo.
 *
 * - Las contraseñas de prueba se guardan ya convertidas a hash con bcrypt,
 *   igual que en producción. Nunca hay contraseñas en texto plano en db.json.
 * - Las medidas se generan con las tablas de los CDC (src/utils/nutricion.js):
 *   cada infante tiene su propio "carril" de crecimiento (puntaje Z) y unos
 *   pocos están fuera de rango a propósito, para que haya alertas.
 * - Es reproducible: usa un generador de números "aleatorios" con semilla fija.
 *   Las fechas se calculan a partir de HOY para que "captura al día" tenga sentido.
 *
 * Cómo ejecutarlo:  npm run semilla   (y después reiniciar npm run server)
 * ¡Cuidado! Sobrescribe db.json y se pierden los cambios hechos desde la app.
 *
 * Cuentas de prueba (contraseña "Padron#2026"):
 *   admin@issste.gob.mx               -> Administrador
 *   coordinador.centro@issste.gob.mx  -> Coordinador regional (Centro)
 *   coordinador.norte@issste.gob.mx   -> Coordinador regional (Norte)
 *   personal.ebdi35@issste.gob.mx     -> Personal de estancia (EBDI 35)
 *   personal.ebdi12@issste.gob.mx     -> Personal de estancia (EBDI 12)
 *   PI-7K3M9Q                         -> Tutora de Sofía y Diego
 *   PI-9RT2WK                         -> Tutora de dos hermanos en la EBDI 12
 * Sin contraseña (para probar "Primer acceso"):
 *   PI-4H8R2T  -> tutor de Mateo
 *   AC-7H4K2M  -> personal nuevo (nuevo.personal@issste.gob.mx)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashearContrasena } from "./seguridad.js";
import { valorEnPuntajeZ, edadEnMeses } from "../src/utils/nutricion.js";
import { hoyISO } from "../src/utils/rangosMedicion.js";

const carpeta = path.dirname(fileURLToPath(import.meta.url));
const hash = await hashearContrasena("Padron#2026");

/* ------------------------------------------------------------------
 * Utilidades
 * ------------------------------------------------------------------ */

//? Generador pseudoaleatorio con semilla (mulberry32): mismos datos cada vez
let semilla = 20261017;
const azar = () => {
  semilla = (semilla + 0x6d2b79f5) | 0;
  let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const entre = (min, max) => min + azar() * (max - min);
const elegir = (lista) => lista[Math.floor(azar() * lista.length)];

/** Suma meses a una fecha "AAAA-MM-DD" (sin pasarse de fin de mes). */
const sumarMeses = (iso, meses) => {
  const [a, m, d] = iso.split("-").map(Number);
  const fecha = new Date(Date.UTC(a, m - 1 + meses, 1));
  const ultimo = new Date(
    Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, 0),
  ).getUTCDate();
  fecha.setUTCDate(Math.min(d, ultimo));
  return fecha.toISOString().slice(0, 10);
};
const conDia = (iso, dia) =>
  `${iso.slice(0, 8)}${String(dia).padStart(2, "0")}`;

const HOY = hoyISO();
const DIA_HOY = Number(HOY.slice(8, 10));

/* ------------------------------------------------------------------
 * Estancias y personal
 * ------------------------------------------------------------------ */

const estancias = [
  {
    id: 35,
    numero: "35",
    nombre: "EBDI 35 Coyoacán",
    tipo: "Propia",
    estado: "Ciudad de México",
    region: "Centro",
  },
  {
    id: 12,
    numero: "12",
    nombre: "EBDI 12 Tlalpan",
    tipo: "Propia",
    estado: "Ciudad de México",
    region: "Centro",
  },
  {
    id: 41,
    numero: "41",
    nombre: "EBDI 41 Iztapalapa",
    tipo: "Contratada",
    estado: "Ciudad de México",
    region: "Centro",
  },
  {
    id: 7,
    numero: "07",
    nombre: "EBDI 07 Benito Juárez",
    tipo: "Propia",
    estado: "Ciudad de México",
    region: "Centro",
  },
  {
    id: 52,
    numero: "52",
    nombre: "EBDI 52 Xochimilco",
    tipo: "OSC",
    estado: "Ciudad de México",
    region: "Centro",
  },
  {
    id: 3,
    numero: "03",
    nombre: "EBDI 03 Monterrey",
    tipo: "Propia",
    estado: "Nuevo León",
    region: "Norte",
  },
  {
    id: 20,
    numero: "20",
    nombre: "EBDI 20 Guadalajara",
    tipo: "Contratada",
    estado: "Jalisco",
    region: "Occidente",
  },
];
//^ estas estancias no han capturado este mes (aparecen como "Pendiente")
const SIN_CAPTURA_ESTE_MES = [41, 52];

const personal = (id, nombre, email, rol, estanciaId, region, extra = {}) => ({
  id,
  nombre,
  email,
  passwordHash: hash,
  claveActivacion: null,
  rol,
  estanciaId,
  region,
  activo: true,
  ...extra,
});
const usuarios = [
  personal(
    1,
    "Patricia Ramírez Díaz",
    "admin@issste.gob.mx",
    "admin",
    null,
    null,
  ),
  personal(
    2,
    "Miguel Ángel Torres",
    "coordinador.centro@issste.gob.mx",
    "coordinador",
    null,
    "Centro",
  ),
  personal(
    3,
    "Laura Hernández Ruiz",
    "personal.ebdi35@issste.gob.mx",
    "estancia",
    35,
    "Centro",
  ),
  personal(
    4,
    "Patricia Soto Vega",
    "personal.ebdi41@issste.gob.mx",
    "estancia",
    41,
    "Centro",
    { activo: false },
  ),
  personal(
    5,
    "Raúl Garza Treviño",
    "coordinador.norte@issste.gob.mx",
    "coordinador",
    null,
    "Norte",
  ),
  personal(
    6,
    "Elena Morales Cruz",
    "personal.ebdi12@issste.gob.mx",
    "estancia",
    12,
    "Centro",
  ),
  personal(
    7,
    "Óscar Villarreal Leal",
    "personal.ebdi03@issste.gob.mx",
    "estancia",
    3,
    "Norte",
  ),
  personal(
    8,
    "Andrea Núñez Ríos",
    "nuevo.personal@issste.gob.mx",
    "estancia",
    7,
    "Centro",
    {
      passwordHash: null,
      claveActivacion: "AC-7H4K2M", //^ todavía no hace su primer acceso
    },
  ),
];
const PERSONAL_POR_ESTANCIA = { 35: 3, 12: 6, 41: 4, 3: 7 };

/* ------------------------------------------------------------------
 * Infantes, tutores y mediciones
 * ------------------------------------------------------------------ */

const NOMBRES = {
  F: [
    "Valentina",
    "Camila",
    "Regina",
    "Ximena",
    "Renata",
    "Romina",
    "Natalia",
    "Mía",
    "Victoria",
    "Daniela",
    "Isabella",
    "Fernanda",
  ],
  M: [
    "Santiago",
    "Mateo",
    "Sebastián",
    "Leonardo",
    "Emiliano",
    "Diego",
    "Iker",
    "Gael",
    "Matías",
    "Daniel",
    "Tadeo",
    "Emilio",
  ],
};
const APELLIDOS = [
  "García",
  "Hernández",
  "Martínez",
  "López",
  "González",
  "Pérez",
  "Rodríguez",
  "Sánchez",
  "Ramírez",
  "Cruz",
  "Flores",
  "Gómez",
  "Morales",
  "Vázquez",
  "Reyes",
  "Jiménez",
  "Torres",
  "Díaz",
  "Ruiz",
  "Mendoza",
];
const TUTORES = [
  "María",
  "Guadalupe",
  "Juana",
  "Rosa",
  "Claudia",
  "Verónica",
  "José",
  "Juan",
  "Luis",
  "Carlos",
  "Alejandra",
  "Gabriela",
];
const CIUDAD = {
  "Ciudad de México": "Ciudad de México",
  "Nuevo León": "Monterrey",
  Jalisco: "Guadalajara",
};

const infantes = [];
const tutores = [];
const mediciones = [];

const nuevoTutor = (nombre, ciudad, claveAcceso, conContrasena) => {
  const tutor = {
    id: tutores.length + 1,
    nombre,
    claveAcceso,
    passwordHash: conContrasena ? hash : null,
    ciudad,
    infanteIds: [],
  };
  tutores.push(tutor);
  return tutor;
};

/** Clave PI- reproducible para los tutores generados. */
const claveGenerada = () => {
  const alfabeto = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let c = "PI-";
  for (let i = 0; i < 6; i++)
    c += alfabeto[Math.floor(azar() * alfabeto.length)];
  return c;
};

const agregarInfante = ({
  nombre,
  apellidos,
  sexo,
  fechaNacimiento,
  estanciaId,
  tutor,
}) => {
  const infante = {
    id: infantes.length + 1,
    nombre,
    apellidos,
    fechaNacimiento,
    sexo,
    expediente: `PI-${String(infantes.length + 2481).padStart(5, "0")}`,
    estanciaId,
    tutorId: tutor.id,
  };
  infantes.push(infante);
  tutor.infanteIds.push(infante.id);
  return infante;
};

const agregarMedicion = (infante, fecha, peso, talla, perimetroCefalico) => {
  mediciones.push({
    id: mediciones.length + 1,
    infanteId: infante.id,
    fecha,
    peso: +peso.toFixed(1),
    talla: +talla.toFixed(1),
    perimetroCefalico: +perimetroCefalico.toFixed(1),
    registradoPor: PERSONAL_POR_ESTANCIA[infante.estanciaId] ?? null,
  });
};

/**
 * ? Historial generado con las tablas CDC.
 * zNutricion: el "carril" del peso respecto a la talla (0 = mediana).
 *   - menos de 24 meses: peso para la talla
 *   - desde 24 meses:    IMC para la edad (peso = IMC · talla²)
 * zTalla: el carril de la talla para la edad.
 * Cada medición varía un poco alrededor de su carril, como en la vida real.
 */
const generarHistorial = (infante, zNutricion, zTalla) => {
  const capturaEsteMes = !SIN_CAPTURA_ESTE_MES.includes(infante.estanciaId);
  //^ última medición: este mes (hasta hoy) o el mes pasado
  let fecha = capturaEsteMes
    ? conDia(HOY, Math.max(1, Math.min(DIA_HOY, Math.ceil(entre(1, DIA_HOY)))))
    : conDia(sumarMeses(HOY, -1), Math.ceil(entre(5, 25)));
  const fechas = [];
  const cuantas = 3 + Math.floor(azar() * 4); //^ de 3 a 6 mediciones, cada 3 meses
  for (let i = 0; i < cuantas && fecha > infante.fechaNacimiento; i++) {
    fechas.unshift(fecha);
    fecha = sumarMeses(fecha, -3);
  }
  for (const f of fechas) {
    const edad = edadEnMeses(infante.fechaNacimiento, f);
    const ruido = () => entre(-0.15, 0.15);
    const talla = valorEnPuntajeZ(
      "talla",
      infante.sexo,
      edad,
      edad,
      zTalla + ruido(),
    );
    let peso = null;
    if (talla && edad < 24) {
      peso = valorEnPuntajeZ(
        "pesoTalla",
        infante.sexo,
        edad,
        talla,
        zNutricion + ruido(),
      );
    } else if (talla) {
      const imc = valorEnPuntajeZ(
        "imc",
        infante.sexo,
        edad,
        edad,
        zNutricion + ruido(),
      );
      peso = imc && imc * (talla / 100) ** 2;
    }
    //^ la tabla de perímetro llega a 36 meses; después crece ~0.3 cm por año
    const edadPc = Math.min(edad, 35.5);
    const pc =
      valorEnPuntajeZ(
        "perimetroCefalico",
        infante.sexo,
        edadPc,
        edadPc,
        zTalla * 0.5 + ruido(),
      ) +
      Math.max(0, edad - 35.5) * 0.025;
    if (talla && peso && pc) agregarMedicion(infante, f, peso, talla, pc);
  }
};

//? Casos fijos que aparecen en los borradores de diseño
const ana = nuevoTutor(
  "Ana López Pérez",
  "Ciudad de México",
  "PI-7K3M9Q",
  true,
);
const sofia = agregarInfante({
  nombre: "Sofía",
  apellidos: "Martínez López",
  sexo: "F",
  fechaNacimiento: "2024-02-15",
  estanciaId: 35,
  tutor: ana,
});
[
  ["2025-02-15", 11.6, 74.5, 44.5],
  ["2025-08-15", 12.6, 80.5, 46.5],
  ["2026-02-16", 13.4, 85.5, 47.8],
  ["2026-09-30", 14.4, 91.4, 49.2],
].forEach(([f, p, t, pc]) => agregarMedicion(sofia, f, p, t, pc));
const diego = agregarInfante({
  nombre: "Diego",
  apellidos: "Martínez López",
  sexo: "M",
  fechaNacimiento: "2021-11-08",
  estanciaId: 35,
  tutor: ana,
});
generarHistorial(diego, 0.4, 0.3);

const jorge = nuevoTutor(
  "Jorge Castillo Mora",
  "Ciudad de México",
  "PI-4H8R2T",
  false,
);
const mateo = agregarInfante({
  nombre: "Mateo",
  apellidos: "Castillo Ruiz",
  sexo: "M",
  fechaNacimiento: "2023-08-03",
  estanciaId: 35,
  tutor: jorge,
});
generarHistorial(mateo, 1.4, 0.1); //^ peso alto: aparecerá con alerta de sobrepeso

const lucia = nuevoTutor(
  "Lucía Herrera Gómez",
  "Ciudad de México",
  "PI-9RT2WK",
  true,
);
const hermanos = ["Regina", "Emiliano"].map((nombre, i) =>
  agregarInfante({
    nombre,
    apellidos: "Herrera Gómez",
    sexo: i === 0 ? "F" : "M",
    fechaNacimiento: i === 0 ? "2022-05-21" : "2024-09-02",
    estanciaId: 12,
    tutor: lucia,
  }),
);
generarHistorial(hermanos[0], -0.3, -0.2);
generarHistorial(hermanos[1], -2.4, -1.0); //^ peso bajo: alerta

//? El resto: unos 6 infantes por estancia con carriles variados
for (const estancia of estancias) {
  const actuales = infantes.filter((i) => i.estanciaId === estancia.id).length;
  for (let k = actuales; k < 6; k++) {
    const sexo = azar() < 0.5 ? "F" : "M";
    const apellidos = `${elegir(APELLIDOS)} ${elegir(APELLIDOS)}`;
    const edadMeses = Math.round(entre(5, 66));
    const nacimiento = conDia(
      sumarMeses(HOY, -edadMeses),
      Math.ceil(entre(1, 28)),
    );
    const tutor = nuevoTutor(
      `${elegir(TUTORES)} ${apellidos.split(" ")[1]} ${elegir(APELLIDOS)}`,
      CIUDAD[estancia.estado],
      claveGenerada(),
      false,
    );
    const infante = agregarInfante({
      nombre: elegir(NOMBRES[sexo]),
      apellidos,
      sexo,
      fechaNacimiento: nacimiento,
      estanciaId: estancia.id,
      tutor,
    });
    //^ alrededor de 1 de cada 10 fuera de rango, para que haya alertas
    const r = azar();
    const zNutricion = r < 0.04 ? 2.2 : r < 0.08 ? -2.3 : entre(-0.9, 0.9);
    const zTalla = r > 0.97 ? -2.4 : entre(-1, 1);
    generarHistorial(infante, zNutricion, zTalla);
  }
}

const db = { usuarios, tutores, estancias, infantes, mediciones, bitacora: [] };
fs.writeFileSync(path.join(carpeta, "db.json"), JSON.stringify(db, null, 2));
console.log(
  `db.json generado: ${estancias.length} estancias, ${infantes.length} infantes, ${mediciones.length} mediciones.`,
);
