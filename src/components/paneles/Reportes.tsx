import { useState } from "react";
import { useNotify, useTranslate } from "react-admin";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { EncabezadoPagina } from "../EncabezadoPagina";
import { FiltrosPanel } from "./FiltrosPanel";
import { useIndicadores } from "../../hooks/useIndicadores";
import type { FiltrosIndicadores } from "../../providers/dataProvider";
import { descargarAlertas, descargarIndicadores } from "../../utils/reportes";
import { periodoActual } from "../../utils/fechas";

/**
 * ? Reportes descargables (CSV) para coordinación y administración.
 * Respetan los filtros elegidos y el alcance del rol (el servidor filtra).
 */
export const Reportes = ({
  titulo,
  campos,
  regionFija,
}: {
  titulo: string;
  campos: ("estancia" | "periodo" | "region" | "entidad")[];
  regionFija?: string | null;
}) => {
  const translate = useTranslate();
  const notify = useNotify();
  const [filtros, setFiltros] = useState<FiltrosIndicadores>({
    periodo: periodoActual(),
  });
  const { data } = useIndicadores(filtros);

  const tarjeta = (
    titulo: string,
    detalle: string,
    boton: string,
    accion: () => void,
  ) => (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 280 }}>
      <CardContent>
        <Typography variant="h2" component="h2">
          {translate(titulo)}
        </Typography>
        <Typography sx={{ mb: 2 }}>{detalle}</Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon aria-hidden="true" />}
          disabled={!data}
          onClick={() => {
            accion();
            notify("reportes.descargado", { type: "success" });
          }}
        >
          {translate(boton)}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <>
      <EncabezadoPagina
        titulo={translate(titulo)}
        subtitulo={translate("reportes.descripcion")}
      />
      <FiltrosPanel
        campos={campos}
        onAplicar={setFiltros}
        regionFija={regionFija}
      />
      {!data ? (
        <CircularProgress aria-label={translate("panel.cargando")} />
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
          {tarjeta(
            "reportes.estancias",
            `${data.totalEstancias} · ${translate("panel.col_estancia")}`,
            "reportes.descargar_estancias",
            () => descargarIndicadores(data, translate),
          )}
          {tarjeta(
            "reportes.alertas",
            `${data.conAlerta} · ${translate("panel.con_alerta")}`,
            "reportes.descargar_alertas",
            () => descargarAlertas(data, translate),
          )}
        </Box>
      )}
    </>
  );
};
