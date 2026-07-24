import { useMutation, useQueryClient } from '@tanstack/react-query';
import { descontarChequeTercero } from '../api/chequeTercero.api';

export const useDescontarChequeTerceroMutation = (config = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    // R39: codigoCuentaBancaria (CuentaBancaria real) en lugar de
    // codigoCuentaDestino.
    mutationFn: ({ codigo, codigoCuentaBancaria, importeCobrado }) =>
      descontarChequeTercero(codigo, codigoCuentaBancaria, importeCobrado),
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
