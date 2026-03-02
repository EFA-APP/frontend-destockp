import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearRolesApi } from "../../api/Rol/roles.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useCrearRol = () => {
    const queryClient = useQueryClient();
    const { mostrarAlerta } = useAlertas();

    return useMutation({
        mutationFn: crearRolesApi,
        onSuccess: () => {
            queryClient.invalidateQueries(["roles"]);
            mostrarAlerta("Éxito", "Rol creado correctamente", "success");
        },
        onError: (error) => {
            mostrarAlerta("Error", error?.response?.data?.message || "Ocurrió un error al crear el rol", "error");
        }
    });
};
