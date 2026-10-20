/**
 * indicadores.js
 * ------------------------------------------------------------------
 * ? Indicadores para los paneles del coordinador y del administrador.
 *
 * Se calculan en el servidor (y no en el navegador) porque requieren
 * revisar TODAS las mediciones del alcance, y porque así el filtro por
 * rol es imposible de saltar: un coordinador solo recibe totales de su región.
 *
 * Definiciones (acordadas con el equipo):
 *   - "Captura al día": la estancia tiene al menos una medición en el periodo (mes).
 *   - Estado nutricional: el de la ÚLTIMA medición de cada infante hasta
 *     el fin del periodo (criterios CDC en src/utils/nutricion.js).
 *   - "Con alerta nutricional": estado distinto de adecuado o talla baja.
 */

import { alcance } from "./permisos.js";
import { evaluarMedicion, ESTADOS } from "../src/utils/nutricion.js";

/** "2026-10" -> último día del mes "2026-10-31". */
const finDeMes = (periodo) => {
  const [a, m] = periodo.split("-").map(Number);
  const ultimo = new Date(Date.UTC(a, m, 0)).getUTCDate();
  return `${periodo}-${String(ultimo).padStart(2, "0")}`;
};

const periodoActual = () => new Date().toISOString().slice(0, 7);

/**
 * ? Calcula los indicadores.
 * filtros: { periodo: "AAAA-MM", estanciaId, region, entidad }
 * (entidad = estado de la República, para no confundir con "estado nutricional")
 */
export const calcularIndicadores = (db, sesion, filtros = {}) => {
  const periodo = /^\d{4}-\d{2}$/.test(filtros.periodo ?? "")
    ? filtros.periodo
    : periodoActual();
  const fin = finDeMes(periodo);
  const permitidas = alcance(db, sesion).estancias; //^ null = todas (admin)

  const estancias = db
    .get("estancias")
    .filter(
      (e) =>
        (permitidas === null || permitidas.includes(e.id)) &&
        (!filtros.estanciaId || e.id === Number(filtros.estanciaId)) &&
        (!filtros.region || e.region === filtros.region) &&
        (!filtros.entidad || e.estado === filtros.entidad),
    )
    .value();

  const infantes = db.get("infantes").value();
  const mediciones = db.get("mediciones").value();
  const distribucion = Object.fromEntries(ESTADOS.map((e) => [e, 0]));
  const alertas = [];

  const porEstancia = estancias.map((estancia) => {
    const suyos = infantes.filter((i) => i.estanciaId === estancia.id);
    let ultimaCaptura = null;
    let alertasEstancia = 0;

    for (const infante of suyos) {
      const historial = mediciones
        .filter((m) => m.infanteId === infante.id && m.fecha <= fin)
        .sort((a, b) => a.fecha.localeCompare(b.fecha));
      const ultima = historial.at(-1);
      if (!ultima) {
        distribucion.sin_dato += 1;
        continue;
      }
      if (!ultimaCaptura || ultima.fecha > ultimaCaptura)
        ultimaCaptura = ultima.fecha;
      const evaluacion = evaluarMedicion(infante, ultima);
      distribucion[evaluacion.estado] += 1;
      if (evaluacion.alerta) {
        alertasEstancia += 1;
        alertas.push({
          infanteId: infante.id,
          nombre: `${infante.nombre} ${infante.apellidos}`,
          estanciaId: estancia.id,
          estado: evaluacion.estado,
          tallaBaja: evaluacion.tallaBaja,
          fecha: ultima.fecha,
        });
      }
    }
    return {
      id: estancia.id,
      nombre: estancia.nombre,
      region: estancia.region,
      entidad: estancia.estado,
      infantes: suyos.length,
      alertas: alertasEstancia,
      ultimaCaptura,
      alDia: !!ultimaCaptura && ultimaCaptura.startsWith(periodo),
    };
  });

  const totalInfantes = porEstancia.reduce((s, e) => s + e.infantes, 0);
  const regiones = [...new Set(porEstancia.map((e) => e.region))].sort();

  return {
    periodo,
    totalInfantes,
    totalEstancias: porEstancia.length,
    estanciasAlDia: porEstancia.filter((e) => e.alDia).length,
    conAlerta: alertas.length,
    pctAlerta: totalInfantes
      ? Math.round((alertas.length / totalInfantes) * 100)
      : 0,
    pctAlDia: porEstancia.length
      ? Math.round(
          (porEstancia.filter((e) => e.alDia).length / porEstancia.length) *
            100,
        )
      : 0,
    distribucion,
    estancias: porEstancia,
    porRegion: regiones.map((region) => ({
      region,
      infantes: porEstancia
        .filter((e) => e.region === region)
        .reduce((s, e) => s + e.infantes, 0),
      alertas: porEstancia
        .filter((e) => e.region === region)
        .reduce((s, e) => s + e.alertas, 0),
    })),
    alertas,
  };
};
