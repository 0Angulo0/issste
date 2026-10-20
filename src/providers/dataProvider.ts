import jsonServerProvider from "ra-data-json-server";
import { DataProvider, fetchUtils } from "react-admin";
import { leerSesion } from "./authProvider";

/**
 * dataProvider
 * ------------------------------------------------------------------
 * Habla con json-server (server/server.js). A cada petición le agrega el
 * token de sesión en el encabezado Authorization, porque el servidor
 * rechaza (401) cualquier petición sin sesión válida.
 *
 * Además de los métodos estándar de react-admin (getList, getOne, create...)
 * agrega dos métodos propios (patrón "custom methods" de la documentación):
 *   - getIndicadores(filtros): totales de los paneles (GET /indicadores)
 *   - restablecerAcceso(tipo, cuentaId): nueva clave (POST /auth/restablecer)
 * Se usan con useDataProvider<DataProviderPadron>().
 */
const API_URL = import.meta.env.VITE_JSON_SERVER_URL;

const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  const sesion = leerSesion();
  return fetchUtils.fetchJson(url, {
    ...options,
    user: sesion
      ? { authenticated: true, token: `Bearer ${sesion.token}` }
      : undefined,
  });
};

/** Filtros de los paneles (todos opcionales). */
export interface FiltrosIndicadores {
  periodo?: string;
  estanciaId?: number | string;
  region?: string;
  entidad?: string;
}

/** Lo que regresa GET /indicadores (ver server/indicadores.js). */
export interface Indicadores {
  periodo: string;
  totalInfantes: number;
  totalEstancias: number;
  estanciasAlDia: number;
  conAlerta: number;
  pctAlerta: number;
  pctAlDia: number;
  distribucion: Record<string, number>;
  estancias: {
    id: number;
    nombre: string;
    region: string;
    entidad: string;
    infantes: number;
    alertas: number;
    ultimaCaptura: string | null;
    alDia: boolean;
  }[];
  porRegion: { region: string; infantes: number; alertas: number }[];
  alertas: {
    infanteId: number;
    nombre: string;
    estanciaId: number;
    estado: string;
    tallaBaja: boolean;
    fecha: string;
  }[];
}

export interface DataProviderPadron extends DataProvider {
  getIndicadores: (filtros: FiltrosIndicadores) => Promise<Indicadores>;
  restablecerAcceso: (
    tipo: "tutor" | "usuario",
    cuentaId: number,
  ) => Promise<{ clave: string }>;
}

export const dataProvider: DataProviderPadron = {
  ...jsonServerProvider(API_URL, httpClient),

  getIndicadores: async (filtros) => {
    const parametros = new URLSearchParams(
      Object.entries(filtros)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => [k, String(v)]),
    );
    const { json } = await httpClient(`${API_URL}/indicadores?${parametros}`);
    return json;
  },

  restablecerAcceso: async (tipo, cuentaId) => {
    const { json } = await httpClient(`${API_URL}/auth/restablecer`, {
      method: "POST",
      body: JSON.stringify({ tipo, cuentaId }),
    });
    return json;
  },
};
