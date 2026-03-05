import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authenticacion.store";
import { iniciarSesionApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useIniciarSesion = () => {
  const queryClient = useQueryClient();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);

  return useMutation({
    mutationFn: iniciarSesionApi,
    onSuccess: (data) => {
      useAuthStore.getState().setAuth({
        token: data.token,
        usuario: data.usuario,
      });

      queryClient.invalidateQueries();
      agregarAlerta({
        type: "success",
        message: "Sesión iniciada correctamente",
      });
    },
    onError: (error) => {
      agregarAlerta({
        type: "error",
        message: error?.response?.data?.message || "Error al iniciar sesión. Verifique sus credenciales.",
      });
    },
  });
};