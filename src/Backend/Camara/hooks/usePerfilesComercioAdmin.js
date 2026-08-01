import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ListarPerfilesComercioAdminApi, PausarUsuariosComercioApi } from "../api/perfiles-comercio.api";

export const usePerfilesComercioAdmin = (filtros = {}) => {
  const queryClient = useQueryClient();

  const { data: comercios = [], isLoading: cargandoComercios } = useQuery({
    queryKey: ["perfiles-comercio-admin", filtros],
    queryFn: () => ListarPerfilesComercioAdminApi(filtros),
  });

  const mutationPausarUsuarios = useMutation({
    mutationFn: PausarUsuariosComercioApi,
    onSuccess: () => {
      // Invalida lo que sea necesario
    },
    onError: (error) => {
      console.error("Error al pausar usuarios del comercio", error?.response?.data?.message);
    },
  });

  return {
    comercios,
    cargandoComercios,
    pausarUsuarios: mutationPausarUsuarios.mutateAsync,
  };
};
