import { useState, useMemo } from "react";
import { usePersistentState } from "../../../../hooks/usePersistentState";
import {
  useObtenerArbolCuentasQuery,
  useObtenerCuentasNoImputablesQuery,
  useCrearCuentaMutation,
  useImportarPlanCuentasMutation,
} from "../../../Contabilidad/queries/useCuentas.query";

const filtrarArbol = (nodos, busqueda, tipo, nivel = 0) => {
  if (!nodos) return [];
  const esBusquedaActiva = busqueda.trim().length > 0;

  return nodos
    .map((nodo) => {
      const hijos = filtrarArbol(
        nodo.subCuentas || nodo.children || [],
        busqueda,
        tipo,
        nivel + 1,
      );

      const coincideBusqueda =
        nodo.codigo.includes(busqueda) ||
        nodo.nombre.toLowerCase().includes(busqueda.toLowerCase());

      const coincideTipo = tipo === "TODOS" || nodo.tipo === tipo;

      if ((coincideBusqueda && coincideTipo) || hijos.length > 0) {
        return {
          ...nodo,
          children: hijos,
          nivel,
          _expandir: esBusquedaActiva && hijos.length > 0,
          _terminoBusqueda: busqueda,
        };
      }

      return null;
    })
    .filter(Boolean);
};

const flattenImputables = (nodes) => {
  let result = [];
  if (!nodes) return result;
  
  nodes.forEach((node) => {
    // Solo agregamos si es explícitamente imputable
    if (node.imputable === true) {
      result.push({
        value: node.codigo,
        label: `${node.codigo} - ${node.nombre}`,
        codigo: node.codigo,
        nombre: node.nombre,
      });
    }
    const children = node.subCuentas || node.children || [];
    if (children.length > 0) {
      result = [...result, ...flattenImputables(children)];
    }
  });
  return result;
};

export const usePlanDeCuentas = () => {
  const {
    data: rawCuentas,
    isLoading,
    refetch,
  } = useObtenerArbolCuentasQuery();

  const {
    data: rawCuentasNoImputables,
    isLoading: isLoadingNoImputables,
  } = useObtenerCuentasNoImputablesQuery();

  const crearCuentaMutation = useCrearCuentaMutation();
  const importarMutation = useImportarPlanCuentasMutation();

  const [busqueda, setBusqueda] = usePersistentState(
    "plan_de_cuentas_busqueda",
    "",
  );
  const [tipo, setTipo] = useState("TODOS");

  const cuentas = useMemo(() => {
    return filtrarArbol(rawCuentas || [], busqueda, tipo);
  }, [rawCuentas, busqueda, tipo]);

  const cuentasImputables = useMemo(() => {
    return flattenImputables(rawCuentas || []);
  }, [rawCuentas]);

  const manejarEditar = (cuenta) => {
    console.log("Editar:", cuenta);
  };

  const manejarEliminar = (cuenta) => {
    console.log("Eliminar/Desactivar:", cuenta);
  };

  const agregarCuenta = async (nueva) => {
    try {
      await crearCuentaMutation.mutateAsync(nueva);
    } catch (error) {
      console.error("Error al crear cuenta:", error);
      throw error;
    }
  };

  const importarPlanBase = async (config) => {
    try {
      await importarMutation.mutateAsync(config);
    } catch (error) {
      console.error("Error al importar plan:", error);
      throw error;
    }
  };

  return {
    cuentas,
    cuentasImputables,
    isLoading,
    busqueda,
    setBusqueda,
    tipo,
    setTipo,
    manejarEditar,
    manejarEliminar,
    agregarCuenta,
    importarPlanBase,
    refetch,
    isImportando: importarMutation.isPending,
    isCreando: crearCuentaMutation.isPending,
    rawCuentas,
    rawCuentasNoImputables,
    isLoadingNoImputables,
  };
};
