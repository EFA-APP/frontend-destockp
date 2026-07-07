import { useQuery } from '@tanstack/react-query';
import { cuentasCorrientesAPI } from '../api';

export const useListarCuentasCorrientes = (filtros) => {
  return useQuery({
    queryKey: ['cuentas-corrientes', filtros],
    queryFn: () => cuentasCorrientesAPI.listarCuentasCorrientes(filtros),
    keepPreviousData: true,
    staleTime: 5000,
  });
};
