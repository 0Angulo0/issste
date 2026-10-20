import { useDataProvider } from "react-admin";
import { useQuery } from "@tanstack/react-query";
import type {
  DataProviderPadron,
  FiltrosIndicadores,
} from "../providers/dataProvider";

/**
 * ? Indicadores de los paneles (GET /indicadores).
 *
 * Usa el método propio getIndicadores del dataProvider con useQuery, como
 * indica la documentación de react-admin para "custom methods". El servidor
 * ya limita los totales al alcance del rol (región, estancia o todo).
 */
export const useIndicadores = (filtros: FiltrosIndicadores) => {
  const dataProvider = useDataProvider<DataProviderPadron>();
  return useQuery({
    queryKey: ["indicadores", filtros],
    queryFn: () => dataProvider.getIndicadores(filtros),
  });
};
