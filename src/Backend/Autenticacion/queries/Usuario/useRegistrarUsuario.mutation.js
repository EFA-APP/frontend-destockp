import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrarseApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useRegistrarUsuario = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: registrarseApi,
        onSuccess: () => {
            queryClient.invalidateQueries(["usuarios"]);
            agregarAlerta({
                type: "success",
                message: "Usuario registrado correctamente",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al registrar el usuario",
            });
        }
    });
};
