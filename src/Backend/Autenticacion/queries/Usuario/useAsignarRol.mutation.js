import { useMutation, useQueryClient } from "@tanstack/react-query";
import { asignarRolApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useAsignarRol = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: asignarRolApi,
        onSuccess: () => {
            // Refrescamos los usuarios para ver el rol actualizado
            queryClient.invalidateQueries({ queryKey: ["usuarios-empresa"] });
            agregarAlerta({
                type: "success",
                message: "El rol fue asignado al usuario correctamente.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al intentar vincular el rol.",
            });
        },
    });
};
