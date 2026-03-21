import { useQuery } from "@tanstack/react-query";
import { ObtenerProductosApi } from "../../api/Producto/producto.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useObtenerProductos = (filtros) => {
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useQuery({
        queryKey: ["productos", filtros],
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
        refetchInterval: 10000, // Refresh every 10 seconds
        refetchIntervalInBackground: true,
    });
};
