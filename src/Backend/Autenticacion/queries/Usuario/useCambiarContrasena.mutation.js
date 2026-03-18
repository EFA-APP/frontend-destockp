import { useMutation } from "@tanstack/react-query";
import { cambiarContrasenaApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useCambiarContrasena = () => {
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: cambiarContrasenaApi,
        onSuccess: () => {
            agregarAlerta({
                type: "success",
                message: "Contraseña cambiada con éxito",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al cambiar la contraseña",
            });
        }
    });
};
