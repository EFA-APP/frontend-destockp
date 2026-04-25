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
    // Manejar tanto { data: [] } como [] directamente por seguridad
    const rawData = queryStock.data;
    const data = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
        ? rawData.data
        : [];

    const productosMap = {};

    data.forEach((producto) => {
      const prodCodigo = producto.codigoSecuencial;
      if (!prodCodigo) return;

      if (!productosMap[prodCodigo]) {
        productosMap[prodCodigo] = {
          ...producto,
          codigoProducto:
            filtros?.tipoArticulo === "MATERIA_PRIMA" ? undefined : prodCodigo,
          codigoMateriaPrima:
            filtros?.tipoArticulo === "MATERIA_PRIMA" ? prodCodigo : undefined,
        };
      }

      // El backend puede devolver stockPorDeposito o stockProductos dependiendo de la entidad
      const stocks = producto.stockPorDeposito || producto.stockProductos || [];

      stocks.forEach((sp) => {
        // Fallback para el código de depósito (ID secuencial)
        const depCodigo = sp.codigoDeposito || sp.deposito?.codigoSecuencial;

        if (depCodigo !== undefined && depCodigo !== null) {
          const key = `dep_${depCodigo}`;
          const valorStock = Number(sp.stock || 0);
          productosMap[prodCodigo][key] =
            (productosMap[prodCodigo][key] || 0) + valorStock;
        }
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
