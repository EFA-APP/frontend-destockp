import { useQuery } from "@tanstack/react-query";
import { obtenerComprobantesPaginados } from "../../api/Comprobante/comprobante.api";
import { useAuthStore } from "../../../Autenticacion/store/authenticacion.store";

export const useObtenerComprobantesQuery = (filtros = {}) => {
  const { unidadActiva } = useAuthStore();

  return useQuery({
    queryKey: ["comprobantes", { 
        ...filtros, 
        unidadActiva: unidadActiva?.id
    }],
    queryFn: () => obtenerComprobantesPaginados(filtros),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });
};
