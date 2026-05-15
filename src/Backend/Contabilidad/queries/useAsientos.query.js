import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarAsientos, crearAsiento } from "../api/asientos.api";

export const useListarAsientosQuery = (filtros = {}) => {
  return useQuery({
    queryKey: ["asientos", filtros],
    queryFn: () => listarAsientos(filtros),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!filtros.codigoEmpresa,
  });
};

export const useCrearAsientoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearAsiento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asientos"] });
    },
  });
};
