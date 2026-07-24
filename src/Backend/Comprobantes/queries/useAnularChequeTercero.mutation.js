import { useMutation, useQueryClient } from '@tanstack/react-query';
import { anularChequeTercero } from '../api/chequeTercero.api';

export const useAnularChequeTerceroMutation = (config = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (codigo) => anularChequeTercero(codigo),
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
