import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authenticacion.store";
import { verificarTokenApi } from "../../api/Usuario/authenticacion.api";

export const useVerificarToken = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUnidadActiva = useAuthStore((state) => state.setUnidadActiva);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const token = useAuthStore((state) => state.token);

  const query = useQuery({
    queryKey: ["verificarToken"],
    queryFn: verificarTokenApi,
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60, // 🔄 Verificar cada 5 minutos proactivamente
  });

  const { data, isError, isSuccess } = query;

  useEffect(() => {
    if (isSuccess && data) {
      const store = useAuthStore.getState();
      const usuarioData = data?.usuario?.usuario || data;

      setAuth({
        token: store.token,
        usuario: usuarioData,
      });

      // Si no tenemos unidad activa, auto-seleccionamos la primera
      if (!store.unidadActiva && usuarioData?.unidadesNegocio?.length > 0) {
        setUnidadActiva(usuarioData.unidadesNegocio[0]);
      }
    }

    if (isError) {
      clearAuth();
    }
  }, [isSuccess, isError, data, setAuth, setUnidadActiva, clearAuth]);

  return query;
};
