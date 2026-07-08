import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rechazarChequeTercero } from '../api/chequeTercero.api';

export const useRechazarChequeTerceroMutation = (config = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (codigo) => rechazarChequeTercero(codigo),
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
