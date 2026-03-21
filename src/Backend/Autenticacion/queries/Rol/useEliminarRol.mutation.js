import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eliminarRolApi } from "../../api/Rol/roles.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useEliminarRol = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: (parametros) => eliminarRolApi(parametros.codigo),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["roles"] }); // Refrescar la lista de roles
            queryClient.invalidateQueries({ queryKey: ["usuarios"] }); // Refrescar usuarios por si tenían este rol asignado

            agregarAlerta({
                type: "success",
                message: data?.mensaje || "Rol eliminado",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Error al eliminar rol",
            });
            console.error("Error al eliminar rol:", error);
        },
    });
};
