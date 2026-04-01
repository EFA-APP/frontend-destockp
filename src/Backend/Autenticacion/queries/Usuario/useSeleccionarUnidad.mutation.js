import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authenticacion.store";
import { seleccionarUnidadApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useSeleccionarUnidad = () => {
    const queryClient = useQueryClient();
    const setUnidadActiva = useAuthStore(state => state.setUnidadActiva);
    const setAuth = useAuthStore(state => state.setAuth);
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: seleccionarUnidadApi,
        onSuccess: (data) => {
            // Actualizar el store con el nuevo token y la unidad activa
            setAuth({
                token: data.token,
                usuario: useAuthStore.getState().usuario
            });
            setUnidadActiva(data.unidadActiva);
            
            queryClient.invalidateQueries();
            agregarAlerta({
                type: "success",
                message: `Actividad seleccionada: ${data.unidadActiva.nombre}`,
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Error al seleccionar la unidad de negocio.",
            });
        },
    });
};
