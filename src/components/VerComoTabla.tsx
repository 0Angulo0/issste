import { ReactNode, useId, useState } from "react";
import { useTranslate } from "react-admin";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";

/**
 * ? Botón "Ver como tabla" + la tabla con los mismos datos de una gráfica.
 *
 * Las gráficas (canvas) no las puede leer un lector de pantalla ni se
 * recorren con teclado; la tabla da la misma información en texto
 * (hallazgo de la Evidencia 1.1: las gráficas dependían solo del color).
 * aria-expanded indica si la tabla está abierta.
 */
export interface Columna {
  campo: string;
  etiqueta: string;
  numero?: boolean; //^ alinea a la derecha
}

export const VerComoTabla = ({
  titulo,
  columnas,
  filas,
  abiertaAlInicio = false,
  textoBoton = "graficas.ver_tabla",
}: {
  titulo: string;
  columnas: Columna[];
  filas: Record<string, ReactNode>[];
  abiertaAlInicio?: boolean;
  textoBoton?: string;
}) => {
  const translate = useTranslate();
  const [abierta, setAbierta] = useState(abiertaAlInicio);
  const id = useId();

  return (
    <Box sx={{ mt: 1.5 }}>
      <Button
        variant="outlined"
        startIcon={<TableChartIcon aria-hidden="true" />}
        aria-expanded={abierta}
        aria-controls={id}
        onClick={() => setAbierta(!abierta)}
      >
        {translate(abierta ? "graficas.ocultar_tabla" : textoBoton)}
      </Button>
      {abierta && (
        <Box id={id} sx={{ mt: 1.5, overflowX: "auto" }}>
          <Table size="small" aria-label={titulo}>
            <TableHead>
              <TableRow>
                {columnas.map((c) => (
                  <TableCell
                    key={c.campo}
                    align={c.numero ? "right" : "left"}
                    sx={{ fontWeight: 700, backgroundColor: "#F4E9EE" }}
                  >
                    {c.etiqueta}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filas.map((fila, i) => (
                <TableRow key={i}>
                  {columnas.map((c) => (
                    <TableCell
                      key={c.campo}
                      align={c.numero ? "right" : "left"}
                    >
                      {fila[c.campo]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
};
