import {
  RecordContextProvider,
  useGetIdentity,
  useGetList,
  useGetOne,
  useTranslate,
} from "react-admin";
import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { EncabezadoPagina } from "../../components/EncabezadoPagina";
import { TarjetaIndicador } from "../../components/TarjetaIndicador";
import { BotonCapturar } from "./mediciones/BotonCapturar";
import { useIndicadores } from "../../hooks/useIndicadores";
import { leerSesion } from "../../providers/authProvider";
import {
  calcularEdad,
  formatearPeriodo,
  periodoActual,
} from "../../utils/fechas";
import type { Infante, Medicion } from "../../hooks/useCrecimiento";

/**
 * ? Inicio del personal de estancia.
 * Resumen del mes y lista de "Pendientes de medir este mes", con el botón
 * "Capturar medidas" de cada infante para ir directo al formulario.
 */
export const DashboardEstancia = () => {
  const translate = useTranslate();
  const { identity } = useGetIdentity();
  const periodo = periodoActual();
  const estanciaId = leerSesion()?.estanciaId;
  const { data: estancia } = useGetOne("estancias", { id: estanciaId });

  const { data: infantes = [] } = useGetList<Infante>("infantes", {
    sort: { field: "apellidos", order: "ASC" },
    pagination: { page: 1, perPage: 500 },
  });
  //^ json-server entiende "fecha_gte": mediciones desde el día 1 del mes
  const { data: delMes = [] } = useGetList<Medicion>("mediciones", {
    filter: { fecha_gte: `${periodo}-01` },
    pagination: { page: 1, perPage: 1000 },
  });
  const { data: indicadores } = useIndicadores({ periodo });

  const medidos = new Set(delMes.map((m) => m.infanteId));
  const pendientes = infantes.filter((i) => !medidos.has(Number(i.id)));

  return (
    <>
      <EncabezadoPagina
        titulo={estancia?.nombre ?? translate("menu.inicio")}
        subtitulo={translate("inicio_estancia.saludo", {
          nombre: identity?.fullName ?? "",
          periodo: formatearPeriodo(periodo),
        })}
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <TarjetaIndicador
          icono={<ChildCareIcon />}
          valor={infantes.length}
          texto={translate("inicio_estancia.infantes")}
        />
        <TarjetaIndicador
          icono={<MonitorWeightIcon />}
          valor={delMes.length}
          texto={translate("inicio_estancia.mediciones_mes")}
        />
        <TarjetaIndicador
          icono={<PendingActionsIcon />}
          valor={pendientes.length}
          texto={translate("inicio_estancia.pendientes")}
        />
        <TarjetaIndicador
          icono={<WarningAmberIcon />}
          valor={indicadores?.conAlerta ?? "–"}
          texto={translate("inicio_estancia.alertas")}
        />
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h2" component="h2">
            {translate("inicio_estancia.pendientes_titulo")}
          </Typography>
          {pendientes.length === 0 ? (
            <Typography>
              {translate("inicio_estancia.sin_pendientes")}
            </Typography>
          ) : (
            <List>
              {pendientes.map((infante) => (
                <ListItem
                  key={infante.id}
                  divider
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {`${infante.nombre} ${infante.apellidos}`}
                    </Typography>
                    <Typography sx={{ color: "#444" }}>
                      {`${calcularEdad(infante.fechaNacimiento)} · ${infante.expediente}`}
                    </Typography>
                  </Box>
                  <RecordContextProvider value={infante}>
                    <BotonCapturar
                      label="mediciones.capturar"
                      variant="outlined"
                    />
                  </RecordContextProvider>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </>
  );
};
