import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eliminarAccionApi } from "../../api/Accion/accion.api";
import { useAlertas } from "../../../../store/useAlertas";

// AMPLIACIÓN feature accion-vinculada-a-submenu (2026-07-29), punto 1:
// borrado FÍSICO real de una Accion (no lógico) -- desvincula en cascada
// cualquier permiso de Rol/usuario que la tuviera asignada.
export const useEliminarAccion = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: eliminarAccionApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["acciones"] });
            agregarAlerta({
                type: "success",
                message: "La acción ha sido eliminada exitosamente.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al intentar eliminar la acción.",
            });
        },
    });
};
