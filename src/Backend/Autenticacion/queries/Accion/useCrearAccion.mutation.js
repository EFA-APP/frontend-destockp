import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearAccionApi } from "../../api/Accion/accion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useCrearAccion = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: crearAccionApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["acciones"] });
            agregarAlerta({
                type: "success",
                message: "La acción ha sido creada exitosamente.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al intentar crear la acción.",
            });
        },
    });
};
