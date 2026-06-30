import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  obtenerArbolCuentas,
  crearCuenta,
  importarPlanCuentas,
  obtenerCuentasNoImputables,
  obtenerCuentasImputablesPorTipo,
  obtenerDescendientesImputables,
} from "../api/cuentas.api";

export const useObtenerArbolCuentasQuery = () => {
  return useQuery({
    queryKey: ["cuentas-arbol"],
    queryFn: () => obtenerArbolCuentas(),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

export const useObtenerCuentasNoImputablesQuery = () => {
  return useQuery({
    queryKey: ["cuentas-no-imputables"],
    queryFn: () => obtenerCuentasNoImputables(),
    staleTime: 1000 * 60 * 10,
  });
};

export const useObtenerDescendientesImputablesQuery = (codigoPadre) => {
  return useQuery({
    queryKey: ["cuentas-descendientes", codigoPadre],
    queryFn: () => obtenerDescendientesImputables(codigoPadre),
    enabled: !!codigoPadre,
    staleTime: 1000 * 60 * 10,
  });
};

export const useObtenerCuentasImputablesQuery = (tipo, busqueda, codigoEmpresa) => {
  return useQuery({
    queryKey: ["cuentas-imputables", tipo, busqueda, codigoEmpresa],
    queryFn: () => obtenerCuentasImputablesPorTipo({ tipo, busqueda, codigoEmpresa }),
    enabled: !!tipo,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCrearCuentaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearCuenta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuentas-arbol"] });
      queryClient.invalidateQueries({ queryKey: ["cuentas-no-imputables"] });
    },
  });
};

export const useImportarPlanCuentasMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importarPlanCuentas,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuentas-arbol"] });
      queryClient.invalidateQueries({ queryKey: ["cuentas-no-imputables"] });
    },
  });
};
