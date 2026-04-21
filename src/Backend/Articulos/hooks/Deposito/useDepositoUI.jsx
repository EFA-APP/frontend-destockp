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
  const queryStock = useDepositosConStock(filtros);

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
    const data = (
      Array.isArray(query.data)
        ? query.data
        : Array.isArray(query.data?.data)
          ? query.data.data
          : []
    ).filter((d) => d.activo !== false);

    if (!busqueda) return data;

    const termino = busqueda.toLowerCase();
    return data.filter(
      (d) =>
        d.nombre?.toLowerCase().includes(termino) ||
        d.descripcion?.toLowerCase().includes(termino) ||
        d.responsable?.toLowerCase().includes(termino) ||
        String(d.codigoSecuencial || "")
          .toLowerCase()
          .includes(termino),
    );
  }, [query.data, busqueda]);

  // Procesamiento de datos para la matriz de stock (Recorriendo Productos)
  const matrizStock = useMemo(() => {
    const data = Array.isArray(queryStock.data?.data)
      ? queryStock.data.data
      : [];

    const productosMap = {};

    data.forEach((producto) => {
      const prodCodigo = producto.codigoSecuencial;

      if (!productosMap[prodCodigo]) {
        productosMap[prodCodigo] = {
          ...producto,
          codigoProducto: prodCodigo,
          codigoMateriaPrima:
            filtros?.tipoArticulo === "MATERIA_PRIMA" ? prodCodigo : undefined,
        };
      }

      producto.stockPorDeposito?.forEach((sp) => {
        const depCodigo = sp.codigoDeposito;
        productosMap[prodCodigo][`dep_${depCodigo}`] =
          (productosMap[prodCodigo][`dep_${depCodigo}`] || 0) + (sp.stock || 0);
      });
    });

    return Object.values(productosMap);
  }, [queryStock.data, filtros?.tipoArticulo]);

  return {
    depositos: depositosFiltrados,
    cargando: query.isLoading,
    error: query.error,
    refetch: () => {
      query.refetch();
      queryStock.refetch();
    },

    matrizStock,
    dataDepositosRaw: (Array.isArray(query.data)
      ? query.data
      : Array.isArray(query.data?.data)
        ? query.data.data
        : []
    ).filter((d) => d.activo !== false),
    cargandoStock: queryStock.isLoading || queryStock.isFetching, // <- Added isFetching for loader during search

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
