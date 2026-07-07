import { useQuery } from '@tanstack/react-query';
import { listarCarteraChequeTercero } from '../api/chequeTercero.api';

export const useCarteraChequeTerceroQuery = (filtros, config = {}) => {
  return useQuery({
    queryKey: ['cheques-terceros-cartera', filtros],
    queryFn: () => listarCarteraChequeTercero(filtros),
    keepPreviousData: true,
    ...config,
  });
};
