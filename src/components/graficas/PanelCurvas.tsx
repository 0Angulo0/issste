import { SyntheticEvent, useEffect } from "react";
import { useGetList, useTranslate } from "react-admin";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import type { Indicador } from "../../utils/nutricion.js";
import { useCrecimiento, type Infante } from "../../hooks/useCrecimiento";
import { CurvaCrecimiento } from "./CurvaCrecimiento";
import { EstadoNutricional } from "../EstadoNutricional";
import { EncabezadoPagina } from "../EncabezadoPagina";
import { calcularEdad } from "../../utils/fechas";

/**
 * ? Pantalla 3: curvas de crecimiento (la usan estancia, admin y familias).
 *
 * - Selector "Infante": muestra solo los infantes que el servidor permite
 *   ver a este rol. El elegido queda en la URL (?infante=1), así el enlace
 *   "Ver curvas" del expediente abre directamente al infante.
 * - Pestañas por indicador (Tabs de MUI: role="tablist", se cambian con
 *   las flechas del teclado).
 * - modoFamilia: solo Peso y Talla, con textos sencillos.
 */
const INDICADORES_PERSONAL: Indicador[] = [
  "peso",
  "talla",
  "perimetroCefalico",
  "pesoTalla",
  "imc",
];
const INDICADORES_FAMILIA: Indicador[] = ["peso", "talla"];

export const PanelCurvas = ({
  titulo,
  modoFamilia = false,
}: {
  titulo: string; //^ llave de traducción, ej. "graficas.titulo_estancia"
  modoFamilia?: boolean;
}) => {
  const translate = useTranslate();
  const [parametros, setParametros] = useSearchParams();
  const indicadores = modoFamilia ? INDICADORES_FAMILIA : INDICADORES_PERSONAL;

  const { data: infantes = [], isPending } = useGetList<Infante>("infantes", {
    sort: { field: "nombre", order: "ASC" },
    pagination: { page: 1, perPage: 500 },
  });

  const infanteId = parametros.get("infante") ?? "";
  const indicador = (parametros.get("indicador") as Indicador) ?? "peso";
  const pestana = indicadores.includes(indicador) ? indicador : "peso";

  //? Si solo hay un infante, o si es una familia, se elige el primero solo
  useEffect(() => {
    if (
      !infanteId &&
      (infantes.length === 1 || (modoFamilia && infantes.length))
    ) {
      setParametros({ infante: String(infantes[0].id) }, { replace: true });
    }
  }, [infanteId, infantes, modoFamilia, setParametros]);

  const { infante, mediciones, ultima, cargando } = useCrecimiento(
    infanteId || null,
  );

  const cambiar = (campo: string, valor: string) => {
    const nuevos = new URLSearchParams(parametros);
    nuevos.set(campo, valor);
    setParametros(nuevos, { replace: true });
  };

  return (
    <>
      <EncabezadoPagina
        titulo={translate(titulo)}
        subtitulo={
          infante &&
          `${infante.nombre} ${infante.apellidos} · ${calcularEdad(infante.fechaNacimiento)}`
        }
      />

      {infantes.length !== 1 && (
        <TextField
          select
          label={translate(
            modoFamilia ? "tutor.elegir_hijo" : "graficas.elegir_infante",
          )}
          helperText={translate(
            modoFamilia
              ? "tutor.elegir_hijo_ayuda"
              : "graficas.elegir_infante_ayuda",
          )}
          value={infanteId}
          onChange={(e) => cambiar("infante", e.target.value)}
          sx={{ minWidth: 320, mb: 2 }}
          disabled={isPending}
        >
          {infantes.map((i) => (
            <MenuItem key={i.id} value={String(i.id)}>
              {`${i.nombre} ${i.apellidos} · ${i.expediente}`}
            </MenuItem>
          ))}
        </TextField>
      )}

      {cargando && (
        <CircularProgress aria-label={translate("ra.page.loading")} />
      )}

      {infante && !cargando && (
        <Card variant="outlined">
          <CardContent>
            <Tabs
              value={pestana}
              onChange={(_e: SyntheticEvent, v: string) =>
                cambiar("indicador", v)
              }
              variant="scrollable"
              allowScrollButtonsMobile
              aria-label={translate("graficas.indicador")}
              sx={{
                mb: 2,
                "& .MuiTab-root": { fontWeight: 600, fontSize: "1rem" },
              }}
            >
              {indicadores.map((ind) => (
                <Tab
                  key={ind}
                  value={ind}
                  label={translate(`graficas.indicadores.${ind}`)}
                  id={`pestana-${ind}`}
                  aria-controls={`panel-${ind}`}
                />
              ))}
            </Tabs>

            <Box
              role="tabpanel"
              id={`panel-${pestana}`}
              aria-labelledby={`pestana-${pestana}`}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" },
                gap: 3,
                alignItems: "start",
              }}
            >
              <CurvaCrecimiento
                indicador={pestana}
                infante={infante}
                mediciones={mediciones}
                modoFamilia={modoFamilia}
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {ultima ? (
                  <EstadoNutricional
                    evaluacion={ultima.evaluacion}
                    nombre={infante.nombre}
                    modoFamilia={modoFamilia}
                  />
                ) : (
                  <Typography>
                    {translate("graficas.sin_mediciones")}
                  </Typography>
                )}
                <Typography sx={{ color: "#444" }}>
                  {translate(
                    modoFamilia ? "graficas.nota_familia" : "graficas.nota_cdc",
                  )}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {!infanteId && !isPending && infantes.length > 1 && (
        <Typography>{translate("graficas.elige_para_ver")}</Typography>
      )}
    </>
  );
};
