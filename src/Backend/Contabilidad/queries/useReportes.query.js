import { useQuery } from "@tanstack/react-query";
import { reportesContablesApi } from "../api/reportes.api";

export const useLibroMayorQuery = (params = {}) => {
  return useQuery({
    queryKey: ["reportes", "libro-mayor", params],
    queryFn: () => reportesContablesApi.obtenerLibroMayor(params),
    enabled: !!params.codigoEmpresa && !!params.codigoCuentaContable,
  });
};

export const useBalanceQuery = (params = {}) => {
  return useQuery({
    queryKey: ["reportes", "balance", params],
    queryFn: () => reportesContablesApi.obtenerBalance(params),
    enabled: !!params.codigoEmpresa,
  });
};

export const useBalanceGeneralQuery = (params = {}) => {
  return useQuery({
    queryKey: ["reportes", "balance-general", params],
    queryFn: () => reportesContablesApi.obtenerBalanceGeneral(params),
    enabled: !!params.codigoEmpresa,
  });
};
