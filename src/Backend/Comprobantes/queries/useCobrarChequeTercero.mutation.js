import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cobrarChequeTercero } from '../api/chequeTercero.api';

export const useCobrarChequeTerceroMutation = (config = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigo, codigoCuentaDestino }) => cobrarChequeTercero(codigo, codigoCuentaDestino),
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
