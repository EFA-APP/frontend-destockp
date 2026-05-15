import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editarSeccionApi } from "../../api/Secciones/seccion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useEditarSeccion = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: editarSeccionApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["obtenerSecciones"] });
            agregarAlerta({
                type: "success",
                message: "La sección ha sido actualizada exitosamente.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al intentar actualizar la sección.",
            });
        },
    });
};
