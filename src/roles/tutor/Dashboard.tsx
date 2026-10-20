import { useTranslate } from "react-admin";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import HistoryIcon from "@mui/icons-material/History";
import { EncabezadoPagina } from "../../components/EncabezadoPagina";
import { BotonEnlace } from "../../components/BotonEnlace";
import { EstadoNutricional } from "../../components/EstadoNutricional";
import { CurvaCrecimiento } from "../../components/graficas/CurvaCrecimiento";
import { useCrecimiento } from "../../hooks/useCrecimiento";
import { SelectorHijo, useHijoElegido } from "./SelectorHijo";
import { calcularEdad, formatearFecha } from "../../utils/fechas";
import { colores } from "../../theme/theme";

/**
 * ? Pantalla 4: Inicio del padre, madre o tutor (borrador "Crecimiento de Sofía").
 *
 * Pensada para personas con poca experiencia técnica:
 *   - Estado en palabras sencillas, con icono (no solo color).
 *   - "Medición reciente" con números grandes.
 *   - Una sola gráfica sencilla (su hijo contra lo esperado) y una frase
 *     que explica cómo leerla.
 */
const Dato = ({ etiqueta, valor }: { etiqueta: string; valor: string }) => (
  <Box>
    <Typography sx={{ color: "#444" }}>{etiqueta}</Typography>
    <Typography
      sx={{ fontSize: "2rem", fontWeight: 700, color: colores.guinda }}
    >
      {valor}
    </Typography>
  </Box>
);

export const DashboardTutor = () => {
  const translate = useTranslate();
  const eleccion = useHijoElegido();
  const { hijo, isPending } = eleccion;
  const { infante, mediciones, ultima, cargando } = useCrecimiento(hijo?.id);

  if (isPending)
    return <CircularProgress aria-label={translate("ra.page.loading")} />;
  if (!hijo) {
    return (
      <>
        <EncabezadoPagina titulo={translate("menu.inicio")} />
        <Typography>{translate("tutor.sin_hijos")}</Typography>
      </>
    );
  }

  return (
    <>
      <EncabezadoPagina
        titulo={translate("tutor.crecimiento_de", { nombre: hijo.nombre })}
        acciones={
          <>
            <BotonEnlace
              to={`/historial?infante=${hijo.id}`}
              label="graficas.ver_tabla_datos"
              variant="outlined"
              icono={<TableChartIcon aria-hidden="true" />}
            />
            <BotonEnlace
              to={`/historial?infante=${hijo.id}`}
              label="tutor.ver_historial"
              variant="outlined"
              icono={<HistoryIcon aria-hidden="true" />}
            />
          </>
        }
      />
      <SelectorHijo {...eleccion} />

      {cargando || !infante ? (
        <CircularProgress aria-label={translate("ra.page.loading")} />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "420px minmax(0, 1fr)" },
            gap: 2.5,
            alignItems: "start",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {ultima ? (
              <>
                <EstadoNutricional
                  evaluacion={ultima.evaluacion}
                  nombre={infante.nombre}
                  modoFamilia
                />
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h2" component="h2">
                      {translate("tutor.medicion_reciente")}
                    </Typography>
                    <Typography sx={{ color: "#444", mb: 1 }}>
                      {translate("tutor.medida_el", {
                        fecha: formatearFecha(ultima.fecha),
                      })}
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                      }}
                    >
                      <Dato
                        etiqueta={translate("tutor.peso")}
                        valor={`${ultima.peso} kg`}
                      />
                      <Dato
                        etiqueta={translate("tutor.talla")}
                        valor={`${ultima.talla} cm`}
                      />
                    </Box>
                    <Dato
                      etiqueta={translate("tutor.edad")}
                      valor={calcularEdad(infante.fechaNacimiento)}
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Typography>
                {translate("nutricion.familia.sin_dato", {
                  nombre: infante.nombre,
                })}
              </Typography>
            )}
          </Box>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h2" component="h2">
                {translate("tutor.peso_tiempo", { nombre: infante.nombre })}
              </Typography>
              <CurvaCrecimiento
                indicador="peso"
                infante={infante}
                mediciones={mediciones}
                modoFamilia
              />
              <Typography sx={{ fontSize: "1.1rem", mt: 2 }}>
                {translate("tutor.explicacion_grafica", {
                  nombre: infante.nombre,
                })}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  );
};
