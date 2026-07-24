import { useQuery } from '@tanstack/react-query';
import { cuentasCorrientesAPI } from '../api';

export const useMetricasCuentaCorriente = () => {
  return useQuery({
    queryKey: ['cuentas-corrientes', 'metricas'],
    queryFn: () => cuentasCorrientesAPI.obtenerMetricas(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });
};
