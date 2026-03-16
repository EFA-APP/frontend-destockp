import { useState, useMemo } from "react";
import { useDepositos } from "../../queries/Deposito/useDepositos.query";
import { useCrearDeposito } from "../../queries/Deposito/useCrearDeposito.mutation";
import { useActualizarDeposito } from "../../queries/Deposito/useActualizarDeposito.mutation";
import { useDepositosConStock } from "../../queries/Deposito/useDepositosConStock.query";

/**
 * Hook de UI para centralizar la lógica de Depósitos.
 */
export const useDepositoUI = () => {
    const [busqueda, setBusqueda] = useState("");
    const [busquedaStock, setBusquedaStock] = useState("");

    // Query para obtener los datos desde la API
    const query = useDepositos();
    const queryStock = useDepositosConStock({ nombre: busquedaStock });

    // Mutaciones
    const mutationCrear = useCrearDeposito();
    const mutationActualizar = useActualizarDeposito();

    // Filtrado local de depósitos (para las cards)
    const depositosFiltrados = useMemo(() => {
        const data = Array.isArray(query.data) ? query.data : (Array.isArray(query.data?.data) ? query.data.data : []);

        if (!busqueda) return data;

        const termino = busqueda.toLowerCase();
        return data.filter(d =>
            d.nombre?.toLowerCase().includes(termino) ||
            d.descripcion?.toLowerCase().includes(termino) ||
            d.responsable?.toLowerCase().includes(termino) ||
            String(d.codigoSecuencial || "").toLowerCase().includes(termino)
        );
    }, [query.data, busqueda]);

    // Procesamiento de datos para la matriz de stock
    const matrizStock = useMemo(() => {
        const data = Array.isArray(queryStock.data) ? queryStock.data : [];

        const productosMap = {};

        data.forEach(deposito => {
            const depCodigo = deposito.codigoSecuencial;

            deposito.stockProductos?.forEach(sp => {
                const prod = sp.producto;
                const prodNombre = prod?.nombre || sp.nombreProducto;
                const codigoProducto = sp.codigoProducto;

                if (!productosMap[codigoProducto]) {
                    productosMap[codigoProducto] = {
                        codigoProducto: codigoProducto,
                        nombre: prodNombre,
                        unidadMedida: prod?.unidadMedida || "UNIDAD",
                        total: 0
                    };
                }

                productosMap[codigoProducto][`dep_${depCodigo}`] = (productosMap[codigoProducto][`dep_${depCodigo}`] || 0) + (sp.stock || 0);
                productosMap[codigoProducto].total += (sp.stock || 0);
            });
        });

        return Object.values(productosMap);
    }, [queryStock.data]);

    return {
        depositos: depositosFiltrados,
        cargando: query.isLoading,
        error: query.error,
        refetch: query.refetch,

        matrizStock,
        dataDepositosRaw: queryStock.data,
        cargandoStock: queryStock.isLoading,

        busqueda,
        setBusqueda,
        busquedaStock,
        setBusquedaStock,

        crearDeposito: mutationCrear.mutateAsync,
        actualizarDeposito: (codigo, data) => mutationActualizar.mutateAsync({ codigo, data }),

        estaCreando: mutationCrear.isPending,
        estaActualizando: mutationActualizar.isPending,
    };
};
