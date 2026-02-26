import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authenticacion.store";
import { iniciarSesionApi } from "../../api/Usuario/authenticacion.api";

export const useIniciarSesion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: iniciarSesionApi,
    onSuccess: (data) => {
      useAuthStore.getState().setAuth({
        token: data.token,
        usuario: data.usuario,
      });

      queryClient.invalidateQueries();
    },
    onError: (error) => {},
  });
};