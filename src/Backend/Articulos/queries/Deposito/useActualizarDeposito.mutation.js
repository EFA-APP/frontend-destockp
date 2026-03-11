import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActualizarDepositoApi } from "../../api/Deposito/deposito.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useActualizarDeposito = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: ({ codigo, data }) => ActualizarDepositoApi(codigo, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["depositos"]);
            agregarAlerta({
                type: "success",
                message: "Depósito actualizado correctamente",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Error al actualizar el depósito",
            });
        },
    });
};
