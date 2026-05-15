import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removerRolApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useRemoverRol = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: removerRolApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usuarios-empresa"] });
            agregarAlerta({
                type: "success",
                message: "El rol fue desvinculado del usuario correctamente.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al intentar desvincular el rol.",
            });
        },
    });
};
