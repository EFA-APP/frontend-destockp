import { useQuery } from '@tanstack/react-query';
import { cuentasCorrientesAPI } from '../api';

export const useListarComprobantesPorContacto = (codigoContacto, filtros) => {
  return useQuery({
    queryKey: ['cuentas-corrientes-comprobantes', codigoContacto, filtros],
    queryFn: () => cuentasCorrientesAPI.listarComprobantesPorContacto(codigoContacto, filtros),
    enabled: !!codigoContacto,
    keepPreviousData: true,
  });
};
