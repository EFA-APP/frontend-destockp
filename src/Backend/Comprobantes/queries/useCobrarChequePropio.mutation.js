import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cobrarChequePropio } from "../api/chequePropio.api";

// Feature "bancos" (T46, R54, R56): sirve tanto para el cobro normal
// (origen ENTREGADO) como para la re-presentación de un cheque RECHAZADO.
export const useCobrarChequePropioMutation = (config = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigo, codigoEmpresa, observaciones }) =>
      cobrarChequePropio(codigo, codigoEmpresa, { observaciones }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(["cheques-propios-cartera"]);
      queryClient.invalidateQueries(["cheques-propios-historial"]);
      queryClient.invalidateQueries(["tesoreria-cuentas-bancarias"]);
      queryClient.invalidateQueries(["tesoreria-movimientos-bancarios"]);
      if (config.onSuccess) config.onSuccess(data, variables, context);
    },
    ...config,
  });
};
