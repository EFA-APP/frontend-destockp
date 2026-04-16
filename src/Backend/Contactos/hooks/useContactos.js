import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ListarContactosApi,
  CrearContactoApi,
  ActualizarContactoApi,
} from "../api/contactos.api";

export const useContactos = (filtros = {}) => {
  const queryClient = useQueryClient();

  const {
    data: dataPaginada = { items: [], total: 0, paginas: 1, paginaActual: 1 },
    isLoading: cargandoContactos,
    refetch,
  } = useQuery({
    queryKey: ["contactos", filtros],
    queryFn: () => ListarContactosApi(filtros),
  });

  const mutationCrear = useMutation({
    mutationFn: CrearContactoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
    },
  });

  const mutationActualizar = useMutation({
    mutationFn: ({ id, dto }) => ActualizarContactoApi(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
    },
  });

  return {
    contactos: dataPaginada.items || [],
    total: dataPaginada.total || 0,
    paginas: dataPaginada.paginas || 1,
    paginaActual: dataPaginada.paginaActual || 1,
    cargandoContactos,
    crearContacto: mutationCrear.mutateAsync,
    actualizarContacto: mutationActualizar.mutateAsync,
    refetch,
  };
};
