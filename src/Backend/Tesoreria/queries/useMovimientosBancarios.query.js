import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { crearMovimientoBancarioAjuste, listarMovimientosBancarios } from "../api/tesoreria.api";

// Feature "bancos" (T46, R19, R20, R71): Libro Banco de una CuentaBancaria.
export const useMovimientosBancariosQuery = (codigoCuenta, filtros = {}, config = {}) => {
  return useQuery({
    queryKey: ["tesoreria-movimientos-bancarios", codigoCuenta, filtros],
    queryFn: () => listarMovimientosBancarios(codigoCuenta, filtros),
    enabled: Boolean(codigoCuenta),
    keepPreviousData: true,
    ...config,
  });
};

export const useCrearMovimientoBancarioAjusteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, contexto }) => crearMovimientoBancarioAjuste(payload, contexto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tesoreria-movimientos-bancarios"] });
      queryClient.invalidateQueries({ queryKey: ["tesoreria-cuentas-bancarias"] });
    },
  });
};
