import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listarReglasCuotaApi,
  crearReglaCuotaApi,
  actualizarReglaCuotaApi,
  eliminarReglaCuotaApi,
} from "../api/cuotas.api";

/**
 * CRUD de `ReglaCuotaCuenta` (§5) para una cuenta contable ("tipo de
 * cuota") dada. Usado por `ModalReglasCuota.jsx`.
 */
export const useReglasCuota = (codigoCuentaContable) => {
  const queryClient = useQueryClient();

  const {
    data: reglas = [],
    isLoading: cargandoReglas,
    refetch,
  } = useQuery({
    queryKey: ["reglas-cuota", codigoCuentaContable],
    queryFn: () => listarReglasCuotaApi({ codigoCuentaContable }),
    enabled: !!codigoCuentaContable,
    staleTime: 10_000,
  });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ["reglas-cuota", codigoCuentaContable] });
    queryClient.invalidateQueries({ queryKey: ["cuotas-listar"] });
  };

  const mutationCrear = useMutation({
    mutationFn: (dto) => crearReglaCuotaApi(dto),
    onSuccess: invalidar,
  });

  const mutationActualizar = useMutation({
    mutationFn: ({ codigo, dto }) => actualizarReglaCuotaApi(codigo, dto),
    onSuccess: invalidar,
  });

  const mutationEliminar = useMutation({
    mutationFn: (codigo) => eliminarReglaCuotaApi(codigo),
    onSuccess: invalidar,
  });

  return {
    reglas,
    cargandoReglas,
    refetch,
    crearRegla: mutationCrear.mutateAsync,
    actualizarRegla: mutationActualizar.mutateAsync,
    eliminarRegla: mutationEliminar.mutateAsync,
    procesando:
      mutationCrear.isPending ||
      mutationActualizar.isPending ||
      mutationEliminar.isPending,
  };
};
