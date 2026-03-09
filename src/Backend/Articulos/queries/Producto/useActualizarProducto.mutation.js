import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActualizarProductoApi } from "../../api/Producto/producto.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useActualizarProducto = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: ({ codigo, data }) => ActualizarProductoApi(codigo, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos"] });
            queryClient.invalidateQueries({ queryKey: ["movimientos"] });
            agregarAlerta({
                type: "success",
                message: "Producto actualizado correctamente",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Error al actualizar el producto",
            });
        },
    });
};
