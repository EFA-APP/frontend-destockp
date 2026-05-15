import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarAccionesPermisoApi } from "../../api/Permiso/permiso.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useActualizarAccionesPermiso = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: actualizarAccionesPermisoApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["permisos"] });
            agregarAlerta({
                type: "success",
                message: "Las acciones del permiso han sido actualizadas.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al actualizar las acciones.",
            });
        },
    });
};
