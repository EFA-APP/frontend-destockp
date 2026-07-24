import { useQuery } from "@tanstack/react-query";
import { listarBancos } from "../api/tesoreria.api";

// Ronda 7 (feature cheques-terceros-tesoreria): catálogo de bancos BCRA
// para el selector de "Banco" al cargar un cheque de tercero.
export const useBancosQuery = (busqueda = "", config = {}) => {
  return useQuery({
    queryKey: ["tesoreria-bancos", busqueda],
    queryFn: () => listarBancos(busqueda),
    staleTime: 1000 * 60 * 10,
    ...config,
  });
};
