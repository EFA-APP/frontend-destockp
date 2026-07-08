import { useMutation, useQueryClient } from "@tanstack/react-query";
import { abrirCajaDiaria } from "../api/tesoreria.api";
import { CAJA_DIARIA_ABIERTA_KEY } from "./useCajaDiariaAbierta.query";
import { CAJA_DIARIA_HISTORIAL_KEY } from "./useHistorialCajaDiaria.query";

export const useAbrirCajaDiariaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, query }) => abrirCajaDiaria(payload, query),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAJA_DIARIA_ABIERTA_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAJA_DIARIA_HISTORIAL_KEY] });
    },
  });
};
