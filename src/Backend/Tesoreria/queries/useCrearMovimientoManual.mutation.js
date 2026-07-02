import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearMovimientoManual } from "../api/tesoreria.api";

export const useCrearMovimientoManualMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, contexto }) =>
      crearMovimientoManual(payload, contexto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tesoreria-movimientos"] });
    },
  });
};
