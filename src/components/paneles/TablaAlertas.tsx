import { useTranslate } from "react-admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import type { Indicadores } from "../../providers/dataProvider";
import { formatearFecha } from "../../utils/fechas";

/**
 * ? Lista de niñas y niños con alerta nutricional (última medición).
 * El nombre es un enlace al expediente (solo lectura para coordinación
 * y administración).
 */
export const TablaAlertas = ({
  alertas,
  estancias,
}: {
  alertas: Indicadores["alertas"];
  estancias: Indicadores["estancias"];
}) => {
  const translate = useTranslate();
  if (!alertas.length)
    return <Typography>{translate("panel.sin_alertas")}</Typography>;
  const nombreEstancia = (id: number) =>
    estancias.find((e) => e.id === id)?.nombre ?? "";

  return (
    <Table size="small" aria-label={translate("panel.alertas_titulo")}>
      <TableHead>
        <TableRow>
          {[
            "infantes.nombre_completo",
            "panel.col_estancia",
            "tutor.col_estado",
            "graficas.col_fecha",
          ].map((llave) => (
            <TableCell
              key={llave}
              sx={{ fontWeight: 700, backgroundColor: "#F4E9EE" }}
            >
              {translate(llave)}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {alertas.map((a) => (
          <TableRow key={a.infanteId}>
            <TableCell>
              <Link to={`/infantes/${a.infanteId}/show`}>{a.nombre}</Link>
            </TableCell>
            <TableCell>{nombreEstancia(a.estanciaId)}</TableCell>
            <TableCell>
              {[
                a.estado !== "adecuado" &&
                  translate(`nutricion.estado.${a.estado}`),
                a.tallaBaja && translate("nutricion.titulo.talla_baja"),
              ]
                .filter(Boolean)
                .join(" · ")}
            </TableCell>
            <TableCell>{formatearFecha(a.fecha)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
