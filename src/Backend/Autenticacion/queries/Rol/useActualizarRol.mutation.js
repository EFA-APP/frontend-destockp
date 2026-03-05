import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarRolApi } from "../../api/Rol/roles.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useActualizarRol = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: ({ codigo, data }) => actualizarRolApi(codigo, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            agregarAlerta({
                type: "success",
                message: "Rol actualizado correctamente",
            });

            queryClient.refetchQueries({ queryKey: ["verificarToken"] });
        },
        onError: (error) => {
            console.error("Error al actualizar rol:", error);
            agregarAlerta({
                type: "error",
                message: "Hubo un error al actualizar el rol",
            });
        },
    });
};
