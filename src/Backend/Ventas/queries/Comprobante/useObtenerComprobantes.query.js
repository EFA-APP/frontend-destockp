import { useQuery } from "@tanstack/react-query";
import { obtenerComprobantesPaginados } from "../../api/Comprobante/comprobante.api";
import { useAuthStore } from "../../../Autenticacion/store/authenticacion.store";

export const useObtenerComprobantesQuery = (filtros = {}) => {
  return useQuery({
    queryKey: ["comprobantes", { ...filtros }],
    queryFn: () => obtenerComprobantesPaginados(filtros),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    enabled: !!filtros.codigoUnidadNegocio
  });
};
