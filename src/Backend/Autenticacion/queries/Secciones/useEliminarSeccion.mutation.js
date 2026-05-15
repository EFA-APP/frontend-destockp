import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eliminarSeccionApi } from "../../api/Secciones/seccion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useEliminarSeccion = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: eliminarSeccionApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["obtenerSecciones"] });
            queryClient.invalidateQueries({ queryKey: ["permisos"] });
            agregarAlerta({
                type: "success",
                message: "La sección y su permiso asociado han sido eliminados.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al intentar eliminar la sección.",
            });
        },
    });
};
