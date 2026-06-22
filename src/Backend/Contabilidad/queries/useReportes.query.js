import { useQuery } from "@tanstack/react-query";
import { reportesContablesApi } from "../api/reportes.api";

export const useLibroMayorQuery = (params = {}) => {
  return useQuery({
    queryKey: ["reportes", "libro-mayor", params],
    queryFn: () => reportesContablesApi.obtenerLibroMayor(params),
    enabled: !!params.codigoEmpresa && !!params.codigoCuentaContable,
  });
};
