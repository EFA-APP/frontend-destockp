import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TransferirDepositoPorStockApi } from "../../api/Deposito/deposito.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useTransferirStock = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: async (payload) => {
            const res = await TransferirDepositoPorStockApi(payload);
            return res;
        },
        onSuccess: () => {
            // Refrescar inventario
            queryClient.invalidateQueries(["depositos"]);
            queryClient.invalidateQueries(["depositosConStock"]); // Asegurar que useDepositosConStock se actualice
            queryClient.invalidateQueries(["movimientos"]);
            
            agregarAlerta({
                type: "success",
                message: "Transferencia realizada con éxito",
            });
        },
        onError: (error) => {
            const errorMsg = error?.response?.data?.message;
            let messageToDisplay = "Error al transferir el stock";
            
            if (typeof errorMsg === "string") {
                messageToDisplay = errorMsg;
            } else if (Array.isArray(errorMsg)) {
                messageToDisplay = errorMsg.map(e => typeof e === 'string' ? e : e.message || JSON.stringify(e)).join(", ");
            }

            agregarAlerta({
                type: "error",
                message: messageToDisplay,
            });
        },
    });
};
