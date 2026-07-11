import { useState, useMemo } from "react";
import { usePersistentState } from "../../../../hooks/usePersistentState";
import { useDepositos } from "../../queries/Deposito/useDepositos.query";
import { useCrearDeposito } from "../../queries/Deposito/useCrearDeposito.mutation";
import { useActualizarDeposito } from "../../queries/Deposito/useActualizarDeposito.mutation";
import { useEliminarDeposito } from "../../queries/Deposito/useEliminarDeposito.mutation";
import { useDepositosConStock } from "../../queries/Deposito/useDepositosConStock.query";
import { useEliminarProducto } from "../../queries/Producto/useEliminarProducto.mutation";
import { useActualizarProducto } from "../../queries/Producto/useActualizarProducto.mutation";
import { useCrearProducto } from "../../queries/Producto/useCrearProducto.mutation";

/**
 * Hook de UI para centralizar la lógica de Depósitos.
 */
export const useDepositoUI = (filtros = {}) => {
  const [busqueda, setBusqueda] = usePersistentState("deposito_ui_busqueda", "");

  // Query para obtener los datos desde la API
  const query = useDepositos();
  const queryStock = useDepositosConStock(filtros, {
    enabled: !!filtros.tipoArticulo,
  });

  // Mutaciones
  const mutationCrear = useCrearDeposito();
  const mutationActualizar = useActualizarDeposito();
  const mutationEliminar = useEliminarDeposito();

  // Mutaciones de Producto (Consolidadas)
  const mutationCrearProducto = useCrearProducto();
  const mutationActualizarProducto = useActualizarProducto();
  const mutationEliminarProducto = useEliminarProducto();

  // Filtrado local de depósitos (para las cards)
  const depositosFiltrados = useMemo(() => {
    const rawData = (
      Array.isArray(query.data)
        ? query.data
        : Array.isArray(query.data?.data)
          ? query.data.data
          : []
    ).filter((d) => d.activo !== false);

    // Ordenar por prioridad:
    // 1. Principal primero
    // 2. Por número de prefijo en nombre si existe (ej: "1. Deposito", "2. Deposito")
    // 3. Alfabéticamente por nombre
    const data = [...rawData].sort((a, b) => {
      if (a.principal && !b.principal) return -1;
      if (!a.principal && b.principal) return 1;

      const numA = parseInt((a.nombre || "").match(/^\d+/)?.[0] || "", 10);
      const numB = parseInt((b.nombre || "").match(/^\d+/)?.[0] || "", 10);

      const hasNumA = !isNaN(numA);
      const hasNumB = !isNaN(numB);

      if (hasNumA && hasNumB) return numA - numB;
      if (hasNumA && !hasNumB) return -1;
      if (!hasNumA && hasNumB) return 1;

      return (a.nombre || "").localeCompare(b.nombre || "", "es");
    });

    if (!busqueda) return data;

    const termino = busqueda.toLowerCase();
    return data.filter(
      (d) =>
        d.nombre?.toLowerCase().includes(termino) ||
        d.descripcion?.toLowerCase().includes(termino) ||
        d.responsable?.toLowerCase().includes(termino) ||
        String(d.codigo || "")
          .toLowerCase()
          .includes(termino),
    );
  }, [query.data, busqueda]);

  // Procesamiento de datos para la matriz de stock (Uso directo de stockPorDeposito)
  const matrizStock = useMemo(() => {
    const rawData = queryStock.data;
    return Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
        ? rawData.data
        : [];
  }, [queryStock.data]);

  return {
    depositos: depositosFiltrados,
    cargando: query.isLoading,
    error: query.error,
    refetch: () => {
      query.refetch();
      queryStock.refetch();
    },

    matrizStock,
    dataDepositosRaw: (() => {
      const rawData = (Array.isArray(query.data)
        ? query.data
        : Array.isArray(query.data?.data)
          ? query.data.data
          : []
      ).filter((d) => d.activo !== false);

      return [...rawData].sort((a, b) => {
        if (a.principal && !b.principal) return -1;
        if (!a.principal && b.principal) return 1;

        const numA = parseInt((a.nombre || "").match(/^\d+/)?.[0] || "", 10);
        const numB = parseInt((b.nombre || "").match(/^\d+/)?.[0] || "", 10);

        const hasNumA = !isNaN(numA);
        const hasNumB = !isNaN(numB);

        if (hasNumA && hasNumB) return numA - numB;
        if (hasNumA && !hasNumB) return -1;
        if (!hasNumA && hasNumB) return 1;

        return (a.nombre || "").localeCompare(b.nombre || "", "es");
      });
    })(),
    cargandoStock:
      queryStock.isLoading ||
      queryStock.isFetching ||
      query.isLoading ||
      query.isFetching, // Esperar a que ambos carguen para evitar columnas vacías

    busqueda,
    setBusqueda,
    meta: queryStock.data?.meta,

    crearDeposito: mutationCrear.mutateAsync,
    actualizarDeposito: (codigo, data) =>
      mutationActualizar.mutateAsync({ codigo, data }),
    eliminarDeposito: (codigo, borrarStockProducto) =>
      mutationEliminar.mutateAsync({ codigo, borrarStockProducto }),

    estaCreando: mutationCrear.isPending,
    estaActualizando: mutationActualizar.isPending,
    estaEliminando: mutationEliminar.isPending,

    // Acciones de Producto
    eliminarProducto: (codigo) => mutationEliminarProducto.mutateAsync(codigo),
    actualizarProducto: (codigo, data) =>
      mutationActualizarProducto.mutateAsync({ codigo, data }),
    crearProducto: mutationCrearProducto.mutateAsync,
    estaEliminandoProducto: mutationEliminarProducto.isPending,
    estaActualizandoProducto: mutationActualizarProducto.isPending,
    estaCreandoProducto: mutationCrearProducto.isPending,
  };
};
