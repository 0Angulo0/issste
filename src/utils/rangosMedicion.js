/**
 * rangosMedicion.js
 * ------------------------------------------------------------------
 * ? Rangos válidos de las medidas, compartidos entre navegador y servidor.
 *
 * Igual que reglasContrasena.js: el navegador avisa mientras se captura
 * y el servidor vuelve a revisar antes de guardar. Los rangos son amplios
 * a propósito (niñas y niños de 0 a 6 años); su objetivo es atrapar
 * errores de captura, como escribir 144 en lugar de 14.4, no diagnosticar.
 * Los tipos para TypeScript están en rangosMedicion.d.ts.
 */

export const RANGOS = {
  peso: { min: 1, max: 40, unidad: "kg" },
  talla: { min: 40, max: 130, unidad: "cm" },
  perimetroCefalico: { min: 30, max: 60, unidad: "cm" },
};

/** Fecha de hoy en formato "AAAA-MM-DD" según la hora local. */
export const hoyISO = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

/**
 * ? Revisa una medición completa (la usa el servidor).
 * Regresa una lista de errores { campo, mensaje }; vacía = válida.
 * fechaNacimiento es opcional: si llega, la fecha no puede ser anterior.
 */
export const validarMedicion = (medicion, fechaNacimiento) => {
  const errores = [];
  const fecha = String(medicion.fecha ?? "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    errores.push({ campo: "fecha", mensaje: "mediciones.errores.fecha" });
  } else if (fecha > hoyISO()) {
    errores.push({ campo: "fecha", mensaje: "mediciones.errores.futura" });
  } else if (fechaNacimiento && fecha < fechaNacimiento) {
    errores.push({
      campo: "fecha",
      mensaje: "mediciones.errores.antes_nacimiento",
    });
  }

  for (const [campo, { min, max }] of Object.entries(RANGOS)) {
    const valor = Number(medicion[campo]);
    if (!Number.isFinite(valor) || valor < min || valor > max) {
      errores.push({ campo, mensaje: "mediciones.errores.rango" });
    }
  }
  return errores;
};
