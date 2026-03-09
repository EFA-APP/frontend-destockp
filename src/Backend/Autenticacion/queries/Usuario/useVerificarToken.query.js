import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authenticacion.store";
import { verificarTokenApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useVerificarToken = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const token = useAuthStore((state) => state.token); // 👈 Obtener token de la store

  const query = useQuery({
    queryKey: ["verificarToken"],
    queryFn: verificarTokenApi,
    enabled: !!token, // 👈 Solo ejecutar si hay un token previo
    retry: false, // No reintentar si el token es inválido
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const { data, isError, isSuccess } = query;

  useEffect(() => {
    if (isSuccess && data) {
      // Actualizamos los datos del usuario si el token es válido
      setAuth({
        token: useAuthStore.getState().token,
        usuario: data?.usuario?.usuario || data,
      });
    }

    if (isError) {
      clearAuth();
      // Ya no agregamos alerta aquí, se encarga el interceptor de Axios (401)
    }
  }, [isSuccess, isError, data, setAuth, clearAuth]);

  return query;
};
