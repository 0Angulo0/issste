import jsonServerProvider from "ra-data-json-server";
import { fetchUtils } from "react-admin";
import { leerSesion } from "./authProvider";

/**
 * dataProvider
 * ------------------------------------------------------------------
 * Habla con json-server (server/server.js). A cada petición le agrega el
 * token de sesión en el encabezado Authorization, porque el servidor
 * rechaza (401) cualquier petición sin sesión válida.
 */
const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  const sesion = leerSesion();
  return fetchUtils.fetchJson(url, {
    ...options,
    user: sesion
      ? { authenticated: true, token: `Bearer ${sesion.token}` }
      : undefined,
  });
};

export const dataProvider = jsonServerProvider(
  import.meta.env.VITE_JSON_SERVER_URL,
  httpClient,
);
