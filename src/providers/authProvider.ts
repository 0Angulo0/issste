import { AuthProvider } from "react-admin";

/**
 * authProvider
 * ------------------------------------------------------------------
 * Conecta react-admin con las rutas /auth/* de server/server.js.
 *
 * La contraseña NUNCA se revisa en el navegador: se envía al servidor,
 * que la compara con bcrypt y, si es correcta, regresa un token de sesión.
 * Aquí solo guardamos ese token y los datos públicos del usuario.
 */

export type Rol = "admin" | "coordinador" | "estancia" | "tutor";

export interface Sesion {
  token: string;
  id: number;
  rol: Rol;
  nombre: string;
  estanciaId: number | null;
  region: string | null;
}

const API_URL = import.meta.env.VITE_JSON_SERVER_URL;
const LLAVE_SESION = "sesion";

/** Lee la sesión guardada en localStorage (o null si no hay). */
export const leerSesion = (): Sesion | null => {
  try {
    const texto = localStorage.getItem(LLAVE_SESION);
    return texto ? (JSON.parse(texto) as Sesion) : null;
  } catch {
    return null;
  }
};

export const authProvider: AuthProvider = {
  // Se llama al enviar el formulario de inicio de sesión.
  // "username" es el correo (personal) o la clave de acceso (tutores).
  async login({ username, password }) {
    const respuesta = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: username, password }),
    });
    if (!respuesta.ok) {
      throw new Error("auth.login_failed");
    }
    const sesion: Sesion = await respuesta.json();
    localStorage.setItem(LLAVE_SESION, JSON.stringify(sesion));
  },

  // Se llama al presionar "Cerrar sesión".
  async logout() {
    const sesion = leerSesion();
    localStorage.removeItem(LLAVE_SESION);
    if (sesion) {
      // Avisamos al servidor para que invalide el token.
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sesion.token}` },
      }).catch(() => undefined);
    }
  },

  // Se llama cuando la API responde con error.
  async checkError({ status }: { status: number }) {
    if (status === 401 || status === 403) {
      localStorage.removeItem(LLAVE_SESION);
      throw new Error("auth.session_expired");
    }
  },

  // Se llama en cada cambio de página para revisar que haya sesión.
  async checkAuth() {
    if (!leerSesion()) {
      throw new Error("auth.auth_required");
    }
  },

  // Nombre que se muestra en la barra superior.
  async getIdentity() {
    const sesion = leerSesion();
    if (!sesion) throw new Error("auth.auth_required");
    return { id: sesion.id, fullName: sesion.nombre };
  },

  // El rol decide qué menú, recursos y pantallas ve cada usuario (ver App.tsx).
  async getPermissions() {
    return leerSesion()?.rol;
  },
};
