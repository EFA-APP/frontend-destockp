import { useMutation, useQueryClient } from '@tanstack/react-query';
import { entregarChequeATercero } from '../api/chequeTercero.api';

export const useEntregarChequeATerceroMutation = (config = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigo, entregadoATercero }) => entregarChequeATercero(codigo, entregadoATercero),
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
