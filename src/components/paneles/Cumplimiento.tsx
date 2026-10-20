import { useState } from "react";
import { useTranslate } from "react-admin";
import { Card, CardContent, CircularProgress } from "@mui/material";
import { EncabezadoPagina } from "../EncabezadoPagina";
import { FiltrosPanel } from "./FiltrosPanel";
import { TablaCumplimiento } from "./TablaCumplimiento";
import { useIndicadores } from "../../hooks/useIndicadores";
import type { FiltrosIndicadores } from "../../providers/dataProvider";
import { periodoActual } from "../../utils/fechas";

/**
 * ? "Cumplimiento de captura": todas las estancias del alcance con su
 * última captura y si están al día en el periodo elegido.
 */
export const Cumplimiento = ({
  campos,
  regionFija,
}: {
  campos: ("estancia" | "periodo" | "region" | "entidad")[];
  regionFija?: string | null;
}) => {
  const translate = useTranslate();
  const [filtros, setFiltros] = useState<FiltrosIndicadores>({
    periodo: periodoActual(),
  });
  const { data } = useIndicadores(filtros);
  return (
    <>
      <EncabezadoPagina titulo={translate("panel.cumplimiento")} />
      <FiltrosPanel
        campos={campos}
        onAplicar={setFiltros}
        regionFija={regionFija}
      />
      {!data ? (
        <CircularProgress aria-label={translate("panel.cargando")} />
      ) : (
        <Card variant="outlined">
          <CardContent>
            <TablaCumplimiento estancias={data.estancias} />
          </CardContent>
        </Card>
      )}
    </>
  );
};
