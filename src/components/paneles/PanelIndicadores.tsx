import { useState } from "react";
import { useTranslate } from "react-admin";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DownloadIcon from "@mui/icons-material/Download";
import { EncabezadoPagina } from "../EncabezadoPagina";
import { TarjetaIndicador } from "../TarjetaIndicador";
import { FiltrosPanel } from "./FiltrosPanel";
import { TablaCumplimiento } from "./TablaCumplimiento";
import { GraficaEstados } from "./GraficaEstados";
import { GraficaBarras } from "../graficas/GraficaBarras";
import { useIndicadores } from "../../hooks/useIndicadores";
import type { FiltrosIndicadores } from "../../providers/dataProvider";
import { descargarIndicadores } from "../../utils/reportes";
import { periodoActual } from "../../utils/fechas";

/**
 * ? Panel de indicadores: Pantalla 5 (coordinador) y Pantalla 6 (admin).
 *
 * Los totales los calcula el servidor (GET /indicadores) y ya vienen
 * limitados al alcance del rol: el coordinador solo recibe su región.
 */
export const PanelIndicadores = ({
  titulo,
  campos,
  regionFija,
  textoDescarga,
  textoTotal,
  porRegion = false,
}: {
  titulo: string;
  campos: ("estancia" | "periodo" | "region" | "entidad")[];
  regionFija?: string | null;
  textoDescarga: string;
  textoTotal: string;
  porRegion?: boolean;
}) => {
  const translate = useTranslate();
  const [filtros, setFiltros] = useState<FiltrosIndicadores>({
    periodo: periodoActual(),
  });
  const { data, isPending } = useIndicadores(filtros);

  return (
    <>
      <EncabezadoPagina
        titulo={translate(titulo)}
        acciones={
          <Button
            variant="contained"
            startIcon={<DownloadIcon aria-hidden="true" />}
            onClick={() => data && descargarIndicadores(data, translate)}
            disabled={!data}
          >
            {translate(textoDescarga)}
          </Button>
        }
      />
      <FiltrosPanel
        campos={campos}
        onAplicar={setFiltros}
        regionFija={regionFija}
      />

      {isPending || !data ? (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <CircularProgress size={24} aria-hidden="true" />
          <Typography>{translate("panel.cargando")}</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2.5 }}>
            <TarjetaIndicador
              icono={<GroupsIcon />}
              valor={data.totalInfantes.toLocaleString("es-MX")}
              texto={translate(textoTotal)}
            />
            <TarjetaIndicador
              icono={<HomeWorkIcon />}
              valor={translate("panel.de", {
                a: data.estanciasAlDia,
                b: data.totalEstancias,
              })}
              texto={translate("panel.captura_al_dia")}
            />
            <TarjetaIndicador
              icono={<WarningAmberIcon />}
              valor={`${data.pctAlerta}%`}
              texto={translate("panel.con_alerta")}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                xl: "minmax(0, 1.4fr) minmax(0, 1fr)", //^ lado a lado solo en pantallas muy anchas: la tabla necesita espacio,
              },
              gap: 2.5,
              alignItems: "start",
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h2" component="h2">
                  {translate("panel.cumplimiento")}
                </Typography>
                <TablaCumplimiento estancias={data.estancias} />
              </CardContent>
            </Card>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {porRegion && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h2" component="h2">
                      {translate("panel.por_region")}
                    </Typography>
                    <GraficaBarras
                      titulo={translate("panel.por_region")}
                      etiquetas={data.porRegion.map((r) => r.region)}
                      valores={data.porRegion.map((r) => r.infantes)}
                      etiquetaValor={translate("panel.cantidad")}
                    />
                  </CardContent>
                </Card>
              )}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h2" component="h2">
                    {translate("panel.estado_nutricional")}
                  </Typography>
                  <GraficaEstados distribucion={data.distribucion} />
                </CardContent>
              </Card>
            </Box>
          </Box>
        </>
      )}
    </>
  );
};
