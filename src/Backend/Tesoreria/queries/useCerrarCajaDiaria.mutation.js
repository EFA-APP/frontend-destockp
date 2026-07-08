import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cerrarCajaDiaria } from "../api/tesoreria.api";
import { CAJA_DIARIA_ABIERTA_KEY } from "./useCajaDiariaAbierta.query";
import { CAJA_DIARIA_HISTORIAL_KEY } from "./useHistorialCajaDiaria.query";

export const useCerrarCajaDiariaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, query }) => cerrarCajaDiaria(payload, query),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAJA_DIARIA_ABIERTA_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAJA_DIARIA_HISTORIAL_KEY] });
    },
  });
};
