import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrarseApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useRegistrarUsuario = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: registrarseApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usuarios-empresa"] });
            agregarAlerta({
                type: "success",
                message: "El usuario ha sido registrado y asignado exitosamente a la empresa.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al intentar crear el usuario.",
            });
        },
    });
};
