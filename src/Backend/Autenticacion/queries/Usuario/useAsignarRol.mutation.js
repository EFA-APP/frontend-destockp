import { useMutation, useQueryClient } from "@tanstack/react-query";
import { asignarRolApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useAsignarRol = () => {
    const queryClient = useQueryClient();
    const { mostrarAlerta } = useAlertas();

    return useMutation({
        mutationFn: asignarRolApi,
        onSuccess: () => {
            queryClient.invalidateQueries(["usuarios"]);
            mostrarAlerta("Éxito", "Rol asignado correctamente", "success");
        },
        onError: (error) => {
            mostrarAlerta("Error", error?.response?.data?.message || "Ocurrió un error al asignar el rol", "error");
        }
    });
};
