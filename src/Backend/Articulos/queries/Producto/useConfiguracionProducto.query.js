import { useQuery } from "@tanstack/react-query";
import { ListarConfiguracionCamposApi } from "../../api/Producto/producto.api";

/**
 * Hook para obtener la configuración de campos dinámicos de PRODUCTO.
 * Implementa cache automático para evitar peticiones duplicadas.
 */
export const useConfiguracionProducto = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["configuracion_producto", params],
    queryFn: () => ListarConfiguracionCamposApi("PRODUCTO", params),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    ...options,
  });
};
