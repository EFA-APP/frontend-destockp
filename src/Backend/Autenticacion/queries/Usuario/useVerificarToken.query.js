import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authenticacion.store";
import { verificarTokenApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useVerificarToken = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);

  const query = useQuery({
    queryKey: ["verificarToken"],
    queryFn: verificarTokenApi,
    retry: false, // No reintentar si el token es inválido
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const { data, error, isError, isSuccess } = query;

  useEffect(() => {
    if (isSuccess && data) {
      // Actualizamos los datos del usuario si el token es válido
      // El token se mantiene el que ya tenemos o el que mande el backend si lo refresca
      console.log(data);
      setAuth({
        token: useAuthStore.getState().token, // Mantenemos el token actual
        usuario: data?.usuario?.usuario || data, // Ajustar según la estructura de respuesta de tu API
      });
    }

    if (isError) {
      clearAuth();
      // Solo mostramos alerta si no es un error de "no hay token" inicial (opcional)
      agregarAlerta({
        type: "error",
        message: error?.response?.data?.message || "Sesión expirada o inválida",
      });
    }
  }, [isSuccess, isError, data, error, setAuth, clearAuth, agregarAlerta]);

  return query;
};
