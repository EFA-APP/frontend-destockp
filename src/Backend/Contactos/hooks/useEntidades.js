import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ListarEntidadesApi,
  CrearEntidadApi,
  EliminarEntidadApi,
} from "../api/contactos.api";

export const useEntidades = () => {
  const queryClient = useQueryClient();

  const { data: entidades = [], isLoading: cargandoEntidades } = useQuery({
    queryKey: ["entidades-contacto"],
    queryFn: () => ListarEntidadesApi(),
  });

  const mutationCrear = useMutation({
    mutationFn: CrearEntidadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entidades-contacto"] });
    },
  });

  const mutationEliminar = useMutation({
    mutationFn: EliminarEntidadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entidades-contacto"] });
    },
  });

  return {
    entidades,
    cargandoEntidades,
    crearEntidad: mutationCrear.mutateAsync,
    eliminarEntidad: mutationEliminar.mutateAsync,
    cargandoCrear: mutationCrear.isPending,
  };
};
