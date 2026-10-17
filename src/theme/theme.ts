import { defaultTheme, RaThemeOptions } from "react-admin";

/**
 * Colores institucionales (Guía de Identidad Gráfica, Gobierno de México
 * 2024-2030, pág. 17). Usar SIEMPRE estos nombres en lugar de escribir
 * códigos hexadecimales sueltos en los componentes.
 *
 * Contraste sobre blanco (WCAG AA pide 4.5:1 para texto normal):
 *   guinda     #611232  -> 12.5:1  ✓ texto y botones
 *   guindaClaro #9b2247 ->  7.6:1  ✓
 *   verde      #1e5b4f  ->  7.9:1  ✓
 *   verdeOscuro #002f2a -> 14.6:1  ✓
 *   dorado     #a57f2c  ->  3.5:1  ✗ solo decorativo o texto grande
 *   gris       #98989A  ->  2.9:1  ✗ solo bordes/decoración, nunca texto
 */
export const colores = {
  guinda: "#611232",
  guindaClaro: "#9b2247",
  verde: "#1e5b4f",
  verdeOscuro: "#002f2a",
  dorado: "#a57f2c",
  doradoClaro: "#e6d194",
  negro: "#161a1d",
  gris: "#98989A",
  // Colores de apoyo para accesibilidad (no son de la Guía):
  foco: "#0B57D0", // anillo de foco visible al navegar con teclado
  error: "#B00020",
  exito: "#1B6E3C",
  fondo: "#F5F7F6",
  borde: "#d5dbd8",
};

/** Anillo de foco visible y consistente para todo elemento enfocable. */
const anilloFoco = {
  outline: `3px solid ${colores.foco}`,
  outlineOffset: "2px",
};

export const tema: RaThemeOptions = {
  ...defaultTheme,
  palette: {
    mode: "light",
    primary: { main: colores.guinda, contrastText: "#fff" },
    secondary: { main: colores.verde, contrastText: "#fff" },
    error: { main: colores.error },
    success: { main: colores.exito },
    background: { default: colores.fondo, paper: "#fff" },
    text: { primary: colores.negro, secondary: "#444" },
  },
  shape: { borderRadius: 8 },
  typography: {
    // Mínimo 16px para texto normal (legibilidad).
    fontSize: 16,
    htmlFontSize: 16,
    h1: { fontSize: "1.9rem", fontWeight: 700, color: colores.guinda },
    h2: { fontSize: "1.25rem", fontWeight: 700, color: colores.guinda },
    button: { textTransform: "none", fontWeight: 600, fontSize: "1rem" },
  },
  components: {
    ...defaultTheme.components,
    MuiButtonBase: {
      styleOverrides: {
        root: { "&.Mui-focusVisible": anilloFoco },
      },
    },
    MuiButton: {
      styleOverrides: {
        // Área mínima táctil de 44px (WCAG 2.5.5).
        root: { minHeight: 44, paddingInline: 20 },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: { "&:focus-visible": anilloFoco, fontWeight: 600 },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { "&.Mui-focused": { outline: `2px solid ${colores.foco}` } },
      },
    },
  },
};
