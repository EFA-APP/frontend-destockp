import { useMutation, useQueryClient } from '@tanstack/react-query';
import { depositarChequeTercero } from '../api/chequeTercero.api';

export const useDepositarChequeTerceroMutation = (config = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigo, codigoCuentaDestino }) => depositarChequeTercero(codigo, codigoCuentaDestino),
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
