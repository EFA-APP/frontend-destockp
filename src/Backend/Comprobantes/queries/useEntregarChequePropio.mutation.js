import { useMutation, useQueryClient } from "@tanstack/react-query";
import { entregarChequePropio } from "../api/chequePropio.api";

// Feature "bancos" (T46, R53).
export const useEntregarChequePropioMutation = (config = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigo, codigoEmpresa, destinatario, observaciones }) =>
      entregarChequePropio(codigo, codigoEmpresa, { destinatario, observaciones }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(["cheques-propios-cartera"]);
      queryClient.invalidateQueries(["cheques-propios-historial"]);
      if (config.onSuccess) config.onSuccess(data, variables, context);
    },
    ...config,
  });
};
