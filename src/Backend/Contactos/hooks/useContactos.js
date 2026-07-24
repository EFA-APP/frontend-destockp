import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ListarContactosApi,
  CrearContactoApi,
  ActualizarContactoApi,
  EliminarContactoApi,
  HabilitarUsuarioMasivoContactoApi,
} from "../api/contactos.api";

export const useContactos = (filtros = {}) => {
  const queryClient = useQueryClient();

  // Bugfix 2026-07-19 (ModalVincularContacto, paso "origen" muestra
  // contactos antes de buscar): `enabled` es un flag opcional de control de
  // la query, no un filtro de negocio — se extrae aparte para no formar
  // parte de `queryKey`/del payload enviado a `ListarContactosApi`. Default
  // `true` preserva el comportamiento de fetch inmediato para todos los
  // callers existentes que no lo pasan.
  const { enabled = true, ...filtrosQuery } = filtros;

  const {
    data: dataPaginada = { items: [], total: 0, paginas: 1, paginaActual: 1 },
    isLoading: cargandoContactos,
    refetch,
  } = useQuery({
    queryKey: ["contactos", filtrosQuery],
    queryFn: () => ListarContactosApi(filtrosQuery),
    enabled,
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

  const mutationEliminar = useMutation({
    mutationFn: EliminarContactoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
    },
  });

  // Feature 34 (contactos-habilitar-usuario-masivo). La mutación individual
  // (`mutationHabilitarUsuario`/`habilitarUsuarioContacto`) fue eliminada en
  // la feature 35 (contactos-tabs-usuarios-relaciones-globales, R4): quedó
  // sin ningún consumidor en el frontend tras retirar la card "Acceso al
  // Sistema" de ListaContactos.jsx. El endpoint backend individual sigue
  // intacto (R3), solo se retiró este wrapper de UI sin llamador.
  const mutationHabilitarUsuarioMasivo = useMutation({
    mutationFn: (dto) => HabilitarUsuarioMasivoContactoApi(dto),
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
    eliminarContacto: mutationEliminar.mutateAsync,
    habilitarUsuarioMasivoContacto: mutationHabilitarUsuarioMasivo.mutateAsync,
    refetch,
  };
};
