import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editarAccionApi } from "../../api/Accion/accion.api";
import { useAlertas } from "../../../../store/useAlertas";

// feature accion-vinculada-a-submenu: edición real de una Accion existente
// (nombre/descripcion/codigoSubMenu). Uso principal: asignar codigoSubMenu
// a las Acciones que arrancaron en NULL.
export const useEditarAccion = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: editarAccionApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["acciones"] });
            agregarAlerta({
                type: "success",
                message: "La acción ha sido actualizada exitosamente.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al intentar actualizar la acción.",
            });
        },
    });
};
