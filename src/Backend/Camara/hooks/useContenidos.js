import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ListarContenidosApi,
  CrearContenidoApi,
  ActualizarContenidoApi,
  EliminarContenidoApi,
} from "../api/contenidos.api";

export const useContenidos = (filtros = {}) => {
  const queryClient = useQueryClient();

  const { enabled = true, ...filtrosQuery } = filtros;

  // El backend devuelve un array plano
  const {
    data: contenidos = [],
    isLoading: cargandoContenidos,
    refetch,
  } = useQuery({
    queryKey: ["contenidos", filtrosQuery],
    queryFn: () => ListarContenidosApi(filtrosQuery),
    enabled,
  });

  const mutationCrear = useMutation({
    mutationFn: CrearContenidoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contenidos"] });
    },
  });

  const mutationActualizar = useMutation({
    mutationFn: ({ id, dto }) => ActualizarContenidoApi(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contenidos"] });
    },
  });

  const mutationEliminar = useMutation({
    mutationFn: EliminarContenidoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contenidos"] });
    },
  });

  return {
    contenidos,
    cargandoContenidos,
    crearContenido: mutationCrear.mutateAsync,
    actualizarContenido: mutationActualizar.mutateAsync,
    eliminarContenido: mutationEliminar.mutateAsync,
    refetch,
  };
};
