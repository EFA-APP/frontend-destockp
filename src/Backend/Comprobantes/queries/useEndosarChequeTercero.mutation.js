import { useMutation, useQueryClient } from '@tanstack/react-query';
import { endosarChequeTercero } from '../api/chequeTercero.api';

export const useEndosarChequeTerceroMutation = (config = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigo, ...datosEndoso }) => endosarChequeTercero(codigo, datosEndoso),
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
