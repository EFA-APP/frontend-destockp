import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { guardarConfiguracionSmtp, probarConfiguracionSmtp, obtenerHistorialCorreos } from './api';

export const useGuardarConfiguracionSmtp = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: guardarConfiguracionSmtp,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['historial-correos', variables.codigoEmpresa]
            });
        }
    });
};

export const useProbarConfiguracionSmtp = () => {
    return useMutation({
        mutationFn: probarConfiguracionSmtp
    });
};

export const useHistorialCorreos = (filtros, enabled = true) => {
    return useQuery({
        queryKey: ['historial-correos', filtros.codigoEmpresa, filtros],
        queryFn: () => obtenerHistorialCorreos(filtros),
        enabled: Boolean(filtros?.codigoEmpresa) && enabled,
    });
};
