import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarEstadoUsuarioApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useActualizarEstadoUsuario = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: actualizarEstadoUsuarioApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usuarios-empresa"] });
            agregarAlerta({
                type: "success",
                message: "El estado del usuario se actualizó correctamente.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al intentar cambiar el estado.",
            });
        },
    });
};
