import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { crearDeposito, obtenerDeposito } from "../api/tesoreria.api";

// Feature "bancos" (T46, R30-R35, R71).
export const useDepositoQuery = (codigo, codigoEmpresa, config = {}) => {
  return useQuery({
    queryKey: ["tesoreria-deposito", codigo, codigoEmpresa],
    queryFn: () => obtenerDeposito(codigo, codigoEmpresa),
    enabled: Boolean(codigo) && Boolean(codigoEmpresa),
    ...config,
  });
};

export const useCrearDepositoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, contexto }) => crearDeposito(payload, contexto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tesoreria-cuentas-bancarias"] });
      queryClient.invalidateQueries({ queryKey: ["tesoreria-movimientos-bancarios"] });
      queryClient.invalidateQueries({ queryKey: ["cheques-terceros-cartera"] });
      queryClient.invalidateQueries({ queryKey: ["cheques-terceros-disponibles"] });
    },
  });
};
