import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarEstadoUsuarioApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useActualizarEstadoUsuario = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: actualizarEstadoUsuarioApi,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(["usuarios"]);
            agregarAlerta({
                type: "success",
                message: `Usuario ${variables.activo ? 'activado' : 'bloqueado'} con éxito`,
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al actualizar el estado del usuario",
            });
        }
    });
};
