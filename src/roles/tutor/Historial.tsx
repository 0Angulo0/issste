import { useTranslate } from "react-admin";
import {
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { EncabezadoPagina } from "../../components/EncabezadoPagina";
import { useCrecimiento } from "../../hooks/useCrecimiento";
import { SelectorHijo, useHijoElegido } from "./SelectorHijo";
import { formatearFecha, textoMeses } from "../../utils/fechas";

/**
 * ? Historial de mediciones para la familia: todas las medidas en una tabla
 * (de la más reciente a la más antigua) con el estado en palabras.
 * Es también la "tabla de datos" equivalente a las gráficas.
 */
export const HistorialTutor = () => {
  const translate = useTranslate();
  const eleccion = useHijoElegido();
  const { hijo } = eleccion;
  const { infante, mediciones, cargando } = useCrecimiento(hijo?.id);

  return (
    <>
      <EncabezadoPagina
        titulo={
          hijo
            ? translate("tutor.historial_de", { nombre: hijo.nombre })
            : translate("menu.historial")
        }
      />
      <SelectorHijo {...eleccion} />
      {cargando && (
        <CircularProgress aria-label={translate("ra.page.loading")} />
      )}
      {infante && !cargando && (
        <Card variant="outlined">
          <CardContent sx={{ overflowX: "auto" }}>
            {mediciones.length === 0 ? (
              <Typography>
                {translate("nutricion.familia.sin_dato", {
                  nombre: infante.nombre,
                })}
              </Typography>
            ) : (
              <Table
                aria-label={translate("tutor.historial_de", {
                  nombre: infante.nombre,
                })}
              >
                <TableHead>
                  <TableRow>
                    {[
                      "graficas.col_fecha",
                      "graficas.col_edad",
                      "resources.mediciones.fields.peso",
                      "resources.mediciones.fields.talla",
                      "resources.mediciones.fields.perimetroCefalico",
                      "tutor.col_estado",
                    ].map((llave, i) => (
                      <TableCell
                        key={llave}
                        align={i >= 2 && i <= 4 ? "right" : "left"}
                        sx={{ fontWeight: 700, backgroundColor: "#F4E9EE" }}
                      >
                        {translate(llave)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...mediciones].reverse().map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{formatearFecha(m.fecha)}</TableCell>
                      <TableCell>
                        {textoMeses(Math.floor(m.evaluacion.edadMeses))}
                      </TableCell>
                      <TableCell align="right">{m.peso}</TableCell>
                      <TableCell align="right">{m.talla}</TableCell>
                      <TableCell align="right">{m.perimetroCefalico}</TableCell>
                      <TableCell>
                        {translate(`nutricion.estado.${m.evaluacion.estado}`)}
                        {m.evaluacion.tallaBaja &&
                          ` · ${translate("nutricion.titulo.talla_baja")}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};
