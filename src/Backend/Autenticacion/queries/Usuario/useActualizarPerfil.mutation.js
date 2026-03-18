import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarPerfilApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useActualizarPerfil = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: actualizarPerfilApi,
        onSuccess: () => {
            queryClient.invalidateQueries(["verificarToken"]); // Refrescar datos usuario
            agregarAlerta({
                type: "success",
                message: "Perfil actualizado con éxito",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al actualizar el perfil",
            });
        }
    });
};
