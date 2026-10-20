import { ReactNode, useEffect } from "react";
import { Layout as RaLayout, useSidebarState } from "react-admin";
import { useMediaQuery, Theme } from "@mui/material";
import { AppBar } from "./AppBar";
import { Menu } from "./Menu";

/**
 * Estructura general de todas las pantallas con sesión iniciada.
 *
 * ? Al pasar de pantalla grande a chica (ej. al girar una tableta) el menú
 * lateral cambia de "fijo" a "flotante". Si estaba abierto, react-admin lo
 * deja como ventana modal invisible que bloquea toda la página para el
 * teclado y el lector de pantalla. Para evitarlo:
 *   1. al volverse chica la pantalla, el menú se cierra, y
 *   2. el layout se vuelve a montar (key) para que el menú empiece limpio.
 */
export const Layout = ({ children }: { children: ReactNode }) => {
  const esChica = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const [abierto, setAbierto] = useSidebarState();

  useEffect(() => {
    if (esChica && abierto) setAbierto(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esChica]);

  return (
    <RaLayout
      key={esChica ? "chica" : "grande"}
      appBar={AppBar}
      menu={Menu}
      //? Los contenedores flex de react-admin crecen al ancho de la tabla más
      //? ancha y en celular toda la página se desplazaba a los lados.
      //? min-width: 0 los deja encoger; las tablas se desplazan por dentro.
      sx={{
        minWidth: 0, //^ react-admin trae "fit-content", que crece con la tabla
        maxWidth: "100vw",
        "& .RaLayout-appFrame, & .RaLayout-contentWithSidebar, & .RaLayout-content, & .RaLayout-content > *, & .RaList-main, & .RaList-main > *":
          { minWidth: 0 },
      }}
    >
      {children}
    </RaLayout>
  );
};
