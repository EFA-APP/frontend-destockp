import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CrearDepositoApi } from "../../api/Deposito/deposito.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useCrearDeposito = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: CrearDepositoApi,
        onSuccess: () => {
            queryClient.invalidateQueries(["depositos"]);
            agregarAlerta({
                type: "success",
                message: "Depósito creado correctamente",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Error al crear el depósito",
            });
        },
    });
};
