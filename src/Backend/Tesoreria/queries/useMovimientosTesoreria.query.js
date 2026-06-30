import { useQuery } from "@tanstack/react-query";
import { listarMovimientosFinanciero } from "../api/tesoreria.api";

export const useMovimientosTesoreriaQuery = (filtros = {}) => {
  return useQuery({
    queryKey: ["tesoreria-movimientos", filtros],
    queryFn: () => listarMovimientosFinanciero(filtros),
    staleTime: 1000 * 60 * 2,
    enabled: !!filtros.codigoEmpresa,
  });
};
