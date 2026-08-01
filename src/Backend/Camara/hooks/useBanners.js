import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ListarBannersApi,
  CrearBannerApi,
  ActualizarBannerApi,
  EliminarBannerApi,
} from "../api/banners.api";

export const useBanners = () => {
  const queryClient = useQueryClient();

  // El backend devuelve un array plano
  const {
    data: banners = [],
    isLoading: cargandoBanners,
    refetch,
  } = useQuery({
    queryKey: ["banners"],
    queryFn: () => ListarBannersApi(),
  });

  const mutationCrear = useMutation({
    mutationFn: CrearBannerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  const mutationActualizar = useMutation({
    mutationFn: ({ id, dto }) => ActualizarBannerApi(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  const mutationEliminar = useMutation({
    mutationFn: EliminarBannerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  return {
    banners,
    cargandoBanners,
    crearBanner: mutationCrear.mutateAsync,
    actualizarBanner: mutationActualizar.mutateAsync,
    eliminarBanner: mutationEliminar.mutateAsync,
    refetch,
  };
};
