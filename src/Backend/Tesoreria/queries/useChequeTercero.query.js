import { useQuery } from "@tanstack/react-query";
import { listarChequesTercero } from "../api/tesoreria.api";

export const useChequeTerceroQuery = (filtros = {}) => {
  return useQuery({
    queryKey: ["tesoreria-cheques-tercero", filtros],
    queryFn: () => listarChequesTercero(filtros),
    staleTime: 1000 * 60 * 5,
    enabled: !!filtros.codigoEmpresa,
  });
};
