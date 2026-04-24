import { useQuery } from "@tanstack/react-query";
import { ListarConfiguracionCamposApi } from "../../api/Producto/producto.api";

/**
 * Hook para obtener la configuración de campos dinámicos de PRODUCTO.
 * Implementa cache automático para evitar peticiones duplicadas.
 */
export const useConfiguracionProducto = (options = {}) => {
  return useQuery({
    queryKey: ["configuracion_producto"],
    queryFn: () => ListarConfiguracionCamposApi("PRODUCTO"),
    staleTime: 1000 * 60 * 60, // 1 hora de cache (los campos no cambian seguido)
    ...options,
  });
};
