import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CrearProductoApi } from "../../api/Producto/producto.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useCrearProducto = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: CrearProductoApi,
        onSuccess: () => {
            queryClient.invalidateQueries(["productos"]);
            agregarAlerta({
                type: "success",
                message: "Producto creado correctamente",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Error al crear el producto",
            });
        },
    });
};
