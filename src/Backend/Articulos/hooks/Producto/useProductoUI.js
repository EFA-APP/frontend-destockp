import { useState, useMemo } from "react";
import { usePersistentState } from "../../../../hooks/usePersistentState";
import { useObtenerProductos } from "../../queries/Producto/useObtenerProductos.query";
import { useCrearProducto } from "../../queries/Producto/useCrearProducto.mutation";
import { useActualizarProducto } from "../../queries/Producto/useActualizarProducto.mutation";
import { useEliminarProducto } from "../../queries/Producto/useEliminarProducto.mutation";

/**
 * Hook de UI para centralizar la lógica de Productos.
 */
export const useProductoUI = (filtrosIniciales = {}, options = {}) => {
    const [busqueda, setBusqueda] = usePersistentState("producto_ui_busqueda", "");

    // Query para obtener los datos desde la API
    const query = useObtenerProductos(filtrosIniciales, options);

    // Mutaciones
    const mutationCrear = useCrearProducto();
    const mutationActualizar = useActualizarProducto();
    const mutationEliminar = useEliminarProducto();

    // Filtrado local
    const productosFiltrados = useMemo(() => {
        // 🚨 Si estamos cargando datos por primera vez (o cambio de clave de unidad), 
        // limpiamos la lista para evitar mostrar datos de la unidad anterior.
        if (query.isLoading) return [];

        const data = Array.isArray(query.data?.data) ? query.data.data : [];
        
        // Si no hay datos (error de fetch o vacío), devolvemos array vacío para evitar crash
        if (data.length === 0) return [];
        if (!busqueda) return data;

        const termino = busqueda.toLowerCase();
        return data.filter(p => 
            p.nombre?.toLowerCase().includes(termino) ||
            p.sabor?.toLowerCase().includes(termino) ||
            String(p.codigoSecuencial || "").toLowerCase().includes(termino)
        );
    }, [query.data, query.isLoading, busqueda]);

    return {
        productos: productosFiltrados,
        meta: query.data?.meta,
        cargando: query.isLoading,
        error: query.error,
        refetch: query.refetch,

        busqueda,
        setBusqueda,

        crearProducto: mutationCrear.mutateAsync,
        actualizarProducto: (codigo, data) => mutationActualizar.mutateAsync({ codigo, data }),
        eliminarProducto: (codigo) => mutationEliminar.mutateAsync(codigo),

        estaCreando: mutationCrear.isPending,
        estaActualizando: mutationActualizar.isPending,
        estaEliminando: mutationEliminar.isPending
    };
};
