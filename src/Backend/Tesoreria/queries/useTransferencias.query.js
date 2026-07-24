import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearTransferencia } from "../api/tesoreria.api";

// Feature "bancos" (T46, R25-R29, R71).
export const useCrearTransferenciaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, contexto }) => crearTransferencia(payload, contexto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tesoreria-cuentas-bancarias"] });
      queryClient.invalidateQueries({ queryKey: ["tesoreria-movimientos-bancarios"] });
    },
  });
};
