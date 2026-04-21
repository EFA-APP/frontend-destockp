import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ListarConfiguracionCamposApi,
  CrearConfiguracionCampoApi,
  ActualizarConfiguracionCampoApi,
  EliminarConfiguracionCampoApi,
} from "../api/contactos.api";

export const useConfiguracionContactos = () => {
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading: cargandoConfigs } = useQuery({
    queryKey: ["configuracion-campos-contacto"],
    queryFn: () => ListarConfiguracionCamposApi(),
  });

  const mutationCrear = useMutation({
    mutationFn: CrearConfiguracionCampoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["configuracion-campos-contacto"],
      });
    },
  });

  const mutationActualizar = useMutation({
    mutationFn: ({ codigoSecuencial, data }) =>
      ActualizarConfiguracionCampoApi(codigoSecuencial, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["configuracion-campos-contacto"],
      });
    },
  });

  const mutationEliminar = useMutation({
    mutationFn: EliminarConfiguracionCampoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["configuracion-campos-contacto"],
      });
    },
  });

  return {
    configs,
    cargandoConfigs,
    crearConfiguracion: mutationCrear.mutateAsync,
    actualizarConfiguracion: mutationActualizar.mutateAsync,
    eliminarConfiguracion: mutationEliminar.mutateAsync,
  };
};
