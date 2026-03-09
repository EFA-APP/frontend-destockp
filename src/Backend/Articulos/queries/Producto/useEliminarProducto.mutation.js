import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActualizarProductoApi } from "../../api/Producto/producto.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useEliminarProducto = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: (codigo) => ActualizarProductoApi(codigo, { activo: false }),
        onSuccess: () => {
            queryClient.invalidateQueries(["productos"]);
            agregarAlerta({
                type: "success",
                message: "Producto eliminado correctamente",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Error al eliminar el producto",
            });
        },
    });
};
