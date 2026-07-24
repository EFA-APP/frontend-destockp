import { useMutation, useQueryClient } from "@tanstack/react-query";
import { anularChequePropio } from "../api/chequePropio.api";

// Feature "bancos" (T46, R57).
export const useAnularChequePropioMutation = (config = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigo, codigoEmpresa, observaciones }) =>
      anularChequePropio(codigo, codigoEmpresa, { observaciones }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(["cheques-propios-cartera"]);
      queryClient.invalidateQueries(["cheques-propios-historial"]);
      if (config.onSuccess) config.onSuccess(data, variables, context);
    },
    ...config,
  });
};
