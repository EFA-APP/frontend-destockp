import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrarseApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useRegistrarUsuario = () => {
    const queryClient = useQueryClient();
    const { mostrarAlerta } = useAlertas();

    return useMutation({
        mutationFn: registrarseApi,
        onSuccess: () => {
            queryClient.invalidateQueries(["usuarios"]);
            mostrarAlerta("Éxito", "Usuario registrado correctamente", "success");
        },
        onError: (error) => {
            mostrarAlerta("Error", error?.response?.data?.message || "Ocurrió un error al registrar el usuario", "error");
        }
    });
};
