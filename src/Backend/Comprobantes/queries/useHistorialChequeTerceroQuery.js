import { useQuery } from '@tanstack/react-query';
import { obtenerHistorialChequeTercero } from '../api/chequeTercero.api';

// R21, R36: historial de auditoría de un cheque. `enabled` para no
// disparar la consulta hasta que se abra la vista de historial de un
// cheque puntual.
export const useHistorialChequeTerceroQuery = (codigo, config = {}) => {
  return useQuery({
    queryKey: ['cheques-terceros-historial', codigo],
    queryFn: () => obtenerHistorialChequeTercero(codigo),
    enabled: Boolean(codigo),
    ...config,
  });
};
