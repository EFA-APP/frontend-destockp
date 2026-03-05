import { useMutation, useQueryClient } from "@tanstack/react-query";
import { asignarRolApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useAsignarRol = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: asignarRolApi,
        onSuccess: () => {
            queryClient.invalidateQueries(["usuarios"]);
            agregarAlerta({
                type: "success",
                message: "Rol asignado correctamente",
            });
            // Disparamos la verificación del token para actualizar los datos del usuario logueado (incluyendo permisos)
            queryClient.refetchQueries({ queryKey: ["verificarToken"] });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al asignar el rol",
            });
        }
    });
};
