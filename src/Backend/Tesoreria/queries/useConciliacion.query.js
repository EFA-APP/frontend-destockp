import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  conciliarExtractoExcel,
  conciliarMovimientosManual,
  desconciliarMovimiento,
  marcarDiferenciaMovimiento,
} from "../api/tesoreria.api";

// Feature "bancos" (T46, R36-R46, R71): conciliación bancaria manual +
// importación de extracto Excel.
const invalidarMovimientos = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["tesoreria-movimientos-bancarios"] });
};

export const useConciliarMovimientosManualMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigoCuenta, payload, contexto }) =>
      conciliarMovimientosManual(codigoCuenta, payload, contexto),
    onSuccess: () => invalidarMovimientos(queryClient),
  });
};

export const useMarcarDiferenciaMovimientoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigoCuenta, payload, contexto }) =>
      marcarDiferenciaMovimiento(codigoCuenta, payload, contexto),
    onSuccess: () => invalidarMovimientos(queryClient),
  });
};

export const useDesconciliarMovimientoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigoCuenta, payload, contexto }) =>
      desconciliarMovimiento(codigoCuenta, payload, contexto),
    onSuccess: () => invalidarMovimientos(queryClient),
  });
};

export const useConciliarExtractoExcelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigoCuenta, payload, contexto }) =>
      conciliarExtractoExcel(codigoCuenta, payload, contexto),
    onSuccess: () => invalidarMovimientos(queryClient),
  });
};
