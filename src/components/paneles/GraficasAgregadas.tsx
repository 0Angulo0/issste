import { useState } from "react";
import { useTranslate } from "react-admin";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import { EncabezadoPagina } from "../EncabezadoPagina";
import { FiltrosPanel } from "./FiltrosPanel";
import { GraficaEstados } from "./GraficaEstados";
import { TablaAlertas } from "./TablaAlertas";
import { GraficaBarras } from "../graficas/GraficaBarras";
import { useIndicadores } from "../../hooks/useIndicadores";
import type { FiltrosIndicadores } from "../../providers/dataProvider";
import { periodoActual } from "../../utils/fechas";

/**
 * ? "Gráficas" del coordinador y del admin: estado nutricional con filtros,
 * alertas por estancia (o por región) y la lista de niñas y niños con alerta.
 * Cada gráfica tiene "Ver como tabla".
 */
export const GraficasAgregadas = ({
  campos,
  regionFija,
  agruparPorRegion = false,
}: {
  campos: ("estancia" | "periodo" | "region" | "entidad")[];
  regionFija?: string | null;
  agruparPorRegion?: boolean;
}) => {
  const translate = useTranslate();
  const [filtros, setFiltros] = useState<FiltrosIndicadores>({
    periodo: periodoActual(),
  });
  const { data, isPending } = useIndicadores(filtros);

  const grupos = agruparPorRegion
    ? (data?.porRegion ?? []).map((r) => ({
        nombre: r.region,
        alertas: r.alertas,
      }))
    : (data?.estancias ?? []).map((e) => ({
        nombre: e.nombre,
        alertas: e.alertas,
      }));

  return (
    <>
      <EncabezadoPagina titulo={translate("menu.graficas")} />
      <FiltrosPanel
        campos={campos}
        onAplicar={setFiltros}
        regionFija={regionFija}
      />
      {isPending || !data ? (
        <CircularProgress aria-label={translate("panel.cargando")} />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 2.5,
            alignItems: "start",
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h2" component="h2">
                {translate("panel.estado_nutricional")}
              </Typography>
              <GraficaEstados distribucion={data.distribucion} />
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h2" component="h2">
                {translate(
                  agruparPorRegion
                    ? "panel.alertas_region"
                    : "panel.col_alertas",
                )}
              </Typography>
              <GraficaBarras
                titulo={translate(
                  agruparPorRegion
                    ? "panel.alertas_region"
                    : "panel.col_alertas",
                )}
                etiquetas={grupos.map((g) => g.nombre.replace("EBDI ", ""))}
                valores={grupos.map((g) => g.alertas)}
                etiquetaValor={translate("panel.cantidad")}
              />
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ gridColumn: { lg: "1 / -1" } }}>
            <CardContent sx={{ overflowX: "auto" }}>
              <Typography variant="h2" component="h2">
                {translate("panel.alertas_titulo")}
              </Typography>
              <TablaAlertas alertas={data.alertas} estancias={data.estancias} />
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  );
};
