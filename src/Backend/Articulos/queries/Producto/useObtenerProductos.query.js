import { useQuery } from "@tanstack/react-query";
import { ObtenerProductosApi } from "../../api/Producto/producto.api";
import { useAlertas } from "../../../../store/useAlertas";
import { useAuthStore } from "../../../Autenticacion/store/authenticacion.store";

export const useObtenerProductos = (filtros, options = {}) => {
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);
    const unidadActiva = useAuthStore((state) => state.unidadActiva);

    // Si se pasa una unidad específica por opciones, tiene prioridad (para contexto local del POS)
    const unidadContexto = options.codigoUnidadNegocio !== undefined 
        ? options.codigoUnidadNegocio 
        : unidadActiva?.codigoSecuencial;

    return useQuery({
        // Incluimos la unidad de contexto en la Query Key para invalidar caché al cambiar de unidad localmente
        queryKey: ["productos", filtros, unidadContexto],
        queryFn: async () => {
            try {
                return await ObtenerProductosApi({
                    ...filtros
                });
            } catch (error) {
                agregarAlerta({
                    type: "error",
                    message: error?.response?.data?.message || "Error al obtener productos",
                });
                throw error;
            }
        },
        refetchInterval: options.refetchInterval ?? false,
        refetchIntervalInBackground: options.refetchIntervalInBackground ?? false,
        ...options
    });
};
