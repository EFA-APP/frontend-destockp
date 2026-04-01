import { useQuery } from "@tanstack/react-query";
import { ObtenerProductosApi } from "../../api/Producto/producto.api";
import { useAlertas } from "../../../../store/useAlertas";
import { useAuthStore } from "../../../Autenticacion/store/authenticacion.store";

export const useObtenerProductos = (filtros, options = {}) => {
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);
    const unidadActiva = useAuthStore((state) => state.unidadActiva);

    return useQuery({
        // Incluimos unidadActiva en la Query Key para invalidar caché al cambiar de contexto
        queryKey: ["productos", filtros, unidadActiva?.codigoSecuencial],
        queryFn: async () => {
            try {
                return await ObtenerProductosApi(filtros);
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
