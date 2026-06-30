import { useQuery } from "@tanstack/react-query";
import { listarLotesTarjeta } from "../api/tesoreria.api";

export const useLotesTarjetaQuery = (filtros = {}) => {
  return useQuery({
    queryKey: ["tesoreria-lotes-tarjeta", filtros],
    queryFn: () => listarLotesTarjeta(filtros),
    staleTime: 1000 * 60 * 5,
    enabled: !!filtros.codigoEmpresa,
  });
};
