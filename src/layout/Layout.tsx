import { ReactNode } from "react";
import { Layout as RaLayout } from "react-admin";
import { AppBar } from "./AppBar";
import { Menu } from "./Menu";

/** Estructura general de todas las pantallas con sesión iniciada. */
export const Layout = ({ children }: { children: ReactNode }) => (
  <RaLayout appBar={AppBar} menu={Menu}>
    {children}
  </RaLayout>
);
