import { useQuery } from '@tanstack/react-query';
import { listarChequeTerceroDisponibles } from '../api/chequeTercero.api';

export const useChequeTerceroDisponiblesQuery = (busqueda = '', config = {}) => {
  return useQuery({
    queryKey: ['cheques-terceros-disponibles', busqueda],
    queryFn: () => listarChequeTerceroDisponibles(busqueda),
    ...config,
  });
};
