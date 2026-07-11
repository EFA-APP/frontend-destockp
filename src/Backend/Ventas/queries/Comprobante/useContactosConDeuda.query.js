import { useQuery } from "@tanstack/react-query";
import { ObtenerContactosConDeudaListApi } from "../../api/Comprobante/comprobante.api";

export const useContactosConDeudaQuery = (tipoOperacion, codigoEmpresa, codigoUnidadNegocio, options = {}) => {
  return useQuery({
    queryKey: ["contactos-con-deuda", tipoOperacion, codigoEmpresa, codigoUnidadNegocio],
    queryFn: async () => {
      const resp = await ObtenerContactosConDeudaListApi(tipoOperacion, codigoEmpresa, codigoUnidadNegocio);
      return {
        contactos: resp?.contactos || [],
        resumenUnidades: resp?.resumenUnidades || []
      };
    },
    enabled: !!tipoOperacion && !!codigoEmpresa,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    ...options,
  });
};
