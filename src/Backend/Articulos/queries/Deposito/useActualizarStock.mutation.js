import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActualizarDepositoPorStockApi } from "../../api/Deposito/deposito.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useActualizarStock = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: async (payload) => {
            // Payload expected:
            // { codigoProducto, codigoDeposito, cantidad, codigoUsuario, nombreUsuario, observacion, generarMovimiento }
            const res = await ActualizarDepositoPorStockApi(payload);
            return res;
        },
        onSuccess: () => {
            // Refrescar las tablas de inventario en tiempo real
            queryClient.invalidateQueries(["depositos"]);
            queryClient.invalidateQueries(["depositosPorStock"]);
            
            agregarAlerta({
                type: "success",
                message: "Stock actualizado correctamente",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Error al actualizar el stock",
            });
        },
    });
};
