import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarUsuariosHabilitadosApi } from "../../api/Accion/accion.api";
import { useAlertas } from "../../../../store/useAlertas";

// R16(b), R33-R36: reemplaza actualizarAccionesPermiso para la parte
// per-usuario.
export const useActualizarUsuariosHabilitados = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: actualizarUsuariosHabilitadosApi,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["usuarios-habilitados"] });
            queryClient.refetchQueries({ queryKey: ["verificarToken"] });
            agregarAlerta({
                type: "success",
                message: "La restricción de usuarios ha sido actualizada.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al actualizar la restricción.",
            });
        },
    });
};
