import { useQuery } from "@tanstack/react-query";
import { obtenerHistorialChequePropio } from "../api/chequePropio.api";

// Feature "bancos" (T46, R61, R71, R73).
export const useHistorialChequePropioQuery = (codigo, codigoEmpresa, config = {}) => {
  return useQuery({
    queryKey: ["cheques-propios-historial", codigo, codigoEmpresa],
    queryFn: () => obtenerHistorialChequePropio(codigo, codigoEmpresa),
    enabled: Boolean(codigo) && Boolean(codigoEmpresa),
    ...config,
  });
};
