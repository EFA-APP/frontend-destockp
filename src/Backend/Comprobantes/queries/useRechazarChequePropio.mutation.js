import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rechazarChequePropio } from "../api/chequePropio.api";

// Feature "bancos" (T46, R55).
export const useRechazarChequePropioMutation = (config = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigo, codigoEmpresa, motivoRechazo, observaciones }) =>
      rechazarChequePropio(codigo, codigoEmpresa, { motivoRechazo, observaciones }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(["cheques-propios-cartera"]);
      queryClient.invalidateQueries(["cheques-propios-historial"]);
      if (config.onSuccess) config.onSuccess(data, variables, context);
    },
    ...config,
  });
};
