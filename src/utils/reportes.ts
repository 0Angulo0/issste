import { downloadCSV } from "react-admin";
import jsonExport from "jsonexport/dist";
import type { Indicadores } from "../providers/dataProvider";

/**
 * ? Reportes en CSV (se abren con Excel u hojas de cálculo).
 *
 * Usa lo mismo que react-admin para exportar: jsonexport (convierte la
 * lista a CSV) y downloadCSV (descarga el archivo). Ver "Exporter" en la
 * documentación de react-admin.
 */
type Traductor = (llave: string, opciones?: Record<string, unknown>) => string;

const descargar = (
  filas: object[],
  encabezados: Record<string, string>,
  archivo: string,
) =>
  jsonExport(
    filas,
    { rename: Object.values(encabezados), headers: Object.keys(encabezados) },
    (_error: unknown, csv: string) => downloadCSV(csv, archivo),
  );

/** Indicadores por estancia del periodo. */
export const descargarIndicadores = (datos: Indicadores, t: Traductor) =>
  descargar(
    datos.estancias.map((e) => ({
      estancia: e.nombre,
      region: e.region,
      entidad: e.entidad,
      infantes: e.infantes,
      alertas: e.alertas,
      ultimaCaptura: e.ultimaCaptura ?? "",
      estado: t(e.alDia ? "panel.al_dia" : "panel.pendiente"),
    })),
    {
      estancia: t("panel.col_estancia"),
      region: t("panel.region"),
      entidad: t("panel.entidad"),
      infantes: t("panel.col_infantes"),
      alertas: t("panel.col_alertas"),
      ultimaCaptura: t("panel.col_ultima"),
      estado: t("panel.col_captura"),
    },
    `indicadores-${datos.periodo}`,
  );

/** Niñas y niños con alerta nutricional en el periodo. */
export const descargarAlertas = (datos: Indicadores, t: Traductor) =>
  descargar(
    datos.alertas.map((a) => ({
      nombre: a.nombre,
      estancia:
        datos.estancias.find((e) => e.id === a.estanciaId)?.nombre ?? "",
      estado: [
        a.estado !== "adecuado" ? t(`nutricion.estado.${a.estado}`) : "",
        a.tallaBaja ? t("nutricion.titulo.talla_baja") : "",
      ]
        .filter(Boolean)
        .join(" · "),
      fecha: a.fecha,
    })),
    {
      nombre: t("infantes.nombre_completo"),
      estancia: t("panel.col_estancia"),
      estado: t("tutor.col_estado"),
      fecha: t("graficas.col_fecha"),
    },
    `alertas-${datos.periodo}`,
  );
