import { useQuery } from "@tanstack/react-query";
import { listarCarteraChequePropio } from "../api/chequePropio.api";

// Feature "bancos" (T46, R71, R73).
export const useCarteraChequePropioQuery = (filtros, config = {}) => {
  return useQuery({
    queryKey: ["cheques-propios-cartera", filtros],
    queryFn: () => listarCarteraChequePropio(filtros),
    keepPreviousData: true,
    ...config,
  });
};
