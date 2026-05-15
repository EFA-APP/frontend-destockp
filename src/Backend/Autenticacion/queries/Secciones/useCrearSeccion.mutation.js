import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearSeccionApi } from "../../api/Secciones/seccion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useCrearSeccion = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: crearSeccionApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["obtenerSecciones"] });
            queryClient.invalidateQueries({ queryKey: ["permisos"] });
            agregarAlerta({
                type: "success",
                message: "La sección ha sido creada exitosamente.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al intentar crear la sección.",
            });
        },
    });
};
