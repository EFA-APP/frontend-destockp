import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarUsuarioApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useActualizarUsuario = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: actualizarUsuarioApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usuarios-empresa"] });
            agregarAlerta({
                type: "success",
                message: "El usuario se ha actualizado correctamente.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al intentar actualizar el usuario.",
            });
        },
    });
};
