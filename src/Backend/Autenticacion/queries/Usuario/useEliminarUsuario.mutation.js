import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eliminarUsuarioApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useEliminarUsuario = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: eliminarUsuarioApi,
        onSuccess: () => {
            queryClient.invalidateQueries(["usuarios"]);
            agregarAlerta({
                type: "success",
                message: "Usuario eliminado correctamente",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al eliminar el usuario",
            });
        }
    });
};
