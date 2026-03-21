import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarPreferenciasTablaApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";
import { useAuthStore } from "../../store/authenticacion.store";

export const useActualizarPreferencias = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);
    const setUsuario = useAuthStore((state) => state.setUsuario);
    const usuario = useAuthStore((state) => state.usuario);

    return useMutation({
        mutationFn: (preferencias) => actualizarPreferenciasTablaApi(preferencias),
        onSuccess: (data, nuevasPreferencias) => {
            // Actualizar localmente el usuario con las nuevas preferencias para evitar fetching
            if (usuario) {
                setUsuario({
                    ...usuario,
                    preferenciasTabla: nuevasPreferencias
                });
            }
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Error al guardar configuración",
            });
            console.error("Error al guardar preferencias:", error);
        },
    });
};
