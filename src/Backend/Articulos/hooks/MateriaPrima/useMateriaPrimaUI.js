import { useState, useMemo } from "react";
import { useObtenerMateriasPrimas } from "../../queries/MateriaPrima/useObtenerMateriasPrimas.query";
import { useCrearMateriaPrima } from "../../queries/MateriaPrima/useCrearMateriaPrima.mutation";
import { useActualizarMateriaPrima } from "../../queries/MateriaPrima/useActualizarMateriaPrima.mutation";
import { useEliminarMateriaPrima } from "../../queries/MateriaPrima/useEliminarMateriaPrima.mutation";

/**
 * Hook de UI para centralizar la lógica de Materia Prima.
 * Proporciona acceso a los datos filtrados y todas las operaciones CRUD.
 */
export const useMateriaPrimaUI = (filtrosIniciales = {}) => {
    const [busqueda, setBusqueda] = useState("");

    // Query para obtener los datos desde la API
    const query = useObtenerMateriasPrimas(filtrosIniciales);

    // Mutaciones para operaciones de escritura
    const mutationCrear = useCrearMateriaPrima();
    const mutationActualizar = useActualizarMateriaPrima();
    const mutationEliminar = useEliminarMateriaPrima();

    // Filtrado local por búsqueda (nombre, código o descripción)
    const materiasPrimasFiltradas = useMemo(() => {
        const data = Array.isArray(query.data) ? query.data : [];
        if (!busqueda) return data;

        const termino = busqueda.toLowerCase();
        return data.filter(mp => 
            mp.nombre?.toLowerCase().includes(termino) ||
            String(mp.codigoSecuencial).toLowerCase().includes(termino) ||
            mp.tipo?.toLowerCase().includes(termino)
        );
    }, [query.data, busqueda]);

    return {
        // --- Datos y Estado ---
        materiasPrimas: materiasPrimasFiltradas,
        cargando: query.isLoading,
        error: query.error,
        refetch: query.refetch,

        // --- Búsqueda ---
        busqueda,
        setBusqueda,

        // --- Operaciones (Exponemos mutateAsync para mayor control en los componentes) ---
        crearMateriaPrima: mutationCrear.mutateAsync,
        actualizarMateriaPrima: (id, data) => mutationActualizar.mutateAsync({ id, data }),
        eliminarMateriaPrima: (id) => mutationEliminar.mutateAsync(id),

        // --- Estados de las Mutaciones ---
        estaCreando: mutationCrear.isPending,
        estaActualizando: mutationActualizar.isPending,
        estaEliminando: mutationEliminar.isPending
    };
};
