import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ListarConfiguracionRelacionesApi,
  CrearConfiguracionRelacionApi,
  ActualizarConfiguracionRelacionApi,
  EliminarConfiguracionRelacionApi,
} from "../api/contactos.api";

// Feature 33 (contactos-relaciones-ui). Mismo patrón que
// useConfiguracionContactos.js. Cubre R25, R28, R31.
export const useConfiguracionRelaciones = () => {
  const queryClient = useQueryClient();

  const { data: configuracionesRelacion = [], isLoading: cargandoConfiguracionesRelacion } =
    useQuery({
      queryKey: ["configuracion-relaciones"],
      queryFn: ListarConfiguracionRelacionesApi,
    });

  const mutationCrear = useMutation({
    mutationFn: CrearConfiguracionRelacionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracion-relaciones"] });
    },
  });

  const mutationActualizar = useMutation({
    mutationFn: ({ codigo, data }) =>
      ActualizarConfiguracionRelacionApi(codigo, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracion-relaciones"] });
    },
  });

  const mutationEliminar = useMutation({
    mutationFn: EliminarConfiguracionRelacionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracion-relaciones"] });
    },
  });

  return {
    configuracionesRelacion,
    cargandoConfiguracionesRelacion,
    crearConfiguracionRelacion: mutationCrear.mutateAsync,
    actualizarConfiguracionRelacion: mutationActualizar.mutateAsync,
    eliminarConfiguracionRelacion: mutationEliminar.mutateAsync,
  };
};
