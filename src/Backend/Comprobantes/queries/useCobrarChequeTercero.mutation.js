import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cobrarChequeTercero } from '../api/chequeTercero.api';

export const useCobrarChequeTerceroMutation = (config = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // R18: importeCobrado es opcional, se usa en la re-presentación de un
    // cheque RECHAZADO cuando el importe cobrado difiere del original.
    // R39: codigoCuentaBancaria (CuentaBancaria real) en lugar de
    // codigoCuentaDestino.
    mutationFn: ({ codigo, codigoCuentaBancaria, importeCobrado }) =>
      cobrarChequeTercero(codigo, codigoCuentaBancaria, importeCobrado),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['cheques-terceros-cartera']);
      queryClient.invalidateQueries(['cheques-terceros-disponibles']);
      if (config.onSuccess) {
        config.onSuccess(data, variables, context);
      }
    },
    ...config,
  });
};
