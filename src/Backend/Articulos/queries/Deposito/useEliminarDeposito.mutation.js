import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EliminarDepositoApi } from "../../api/Deposito/deposito.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useEliminarDeposito = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: ({ codigo, borrarStockProducto }) => EliminarDepositoApi(codigo, borrarStockProducto),
        onSuccess: () => {
            queryClient.invalidateQueries(["depositos"]);
            queryClient.invalidateQueries(["depositosConStock"]); // Invalidate matrix too
            agregarAlerta({
                type: "success",
                message: "Depósito eliminado correctamente",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Error al eliminar el depósito",
            });
        },
    });
};
