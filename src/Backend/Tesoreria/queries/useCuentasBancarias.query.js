import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  crearCuentaBancaria,
  editarCuentaBancaria,
  listarCuentasBancarias,
  obtenerCuentaBancaria,
} from "../api/tesoreria.api";

// Feature "bancos" (T46, R5, R71): ABM de CuentaBancaria, filtrado
// siempre por empresa (nunca expone cuentas de otra empresa).
export const useCuentasBancariasQuery = (filtros = {}, config = {}) => {
  return useQuery({
    queryKey: ["tesoreria-cuentas-bancarias", filtros],
    queryFn: () => listarCuentasBancarias(filtros),
    enabled: Boolean(filtros.codigoEmpresa),
    ...config,
  });
};

export const useCuentaBancariaQuery = (codigo, codigoEmpresa, config = {}) => {
  return useQuery({
    queryKey: ["tesoreria-cuenta-bancaria", codigo, codigoEmpresa],
    queryFn: () => obtenerCuentaBancaria(codigo, codigoEmpresa),
    enabled: Boolean(codigo) && Boolean(codigoEmpresa),
    ...config,
  });
};

export const useCrearCuentaBancariaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, contexto }) => crearCuentaBancaria(payload, contexto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tesoreria-cuentas-bancarias"] });
    },
  });
};

export const useEditarCuentaBancariaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigo, payload, contexto }) => editarCuentaBancaria(codigo, payload, contexto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tesoreria-cuentas-bancarias"] });
      queryClient.invalidateQueries({ queryKey: ["tesoreria-cuenta-bancaria"] });
    },
  });
};
