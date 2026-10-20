import { useTranslate } from "react-admin";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { BotonEnlace } from "../BotonEnlace";
import type { Indicadores } from "../../providers/dataProvider";
import { formatearFecha } from "../../utils/fechas";
import { colores } from "../../theme/theme";

/**
 * ? Tabla "Cumplimiento de captura" (borrador del coordinador).
 * El estado lleva icono + texto ("Al día" / "Pendiente"), no solo color,
 * y cada fila tiene "Ver detalle" con texto, que se abre con teclado.
 */
export const TablaCumplimiento = ({
  estancias,
}: {
  estancias: Indicadores["estancias"];
}) => {
  const translate = useTranslate();
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table aria-label={translate("panel.cumplimiento")}>
        <TableHead>
          <TableRow>
            {[
              ["panel.col_estancia", false],
              ["panel.col_ultima", false],
              ["panel.col_estado", false],
              ["panel.col_infantes", true],
              ["panel.col_alertas", true],
              ["panel.col_accion", false],
            ].map(([llave, numero]) => (
              <TableCell
                key={String(llave)}
                align={numero ? "right" : "left"}
                sx={{ fontWeight: 700, backgroundColor: "#F4E9EE" }}
              >
                {translate(String(llave))}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {estancias.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{e.nombre}</TableCell>
              <TableCell>
                {e.ultimaCaptura
                  ? formatearFecha(e.ultimaCaptura)
                  : translate("panel.sin_captura")}
              </TableCell>
              <TableCell>
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    gap: 0.75,
                    alignItems: "center",
                    fontWeight: 600,
                    color: e.alDia ? colores.exito : "#8A4B00",
                  }}
                >
                  {e.alDia ? (
                    <CheckCircleOutlineIcon aria-hidden="true" />
                  ) : (
                    <ScheduleIcon aria-hidden="true" />
                  )}
                  {translate(e.alDia ? "panel.al_dia" : "panel.pendiente")}
                </Box>
              </TableCell>
              <TableCell align="right">{e.infantes}</TableCell>
              <TableCell align="right">{e.alertas}</TableCell>
              <TableCell>
                <BotonEnlace
                  to={`/estancias/${e.id}/show`}
                  label="panel.ver_detalle"
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
