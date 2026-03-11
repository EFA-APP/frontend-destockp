import React from "react";
import DataTable from "../../../UI/DataTable/DataTable";
import { ArcaIcono } from "../../../../assets/Icons";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import { generarColumnasStock } from "./ColumnasDepositoStock";

/**
 * Componente TablaDepositoStock: Visualización de la matriz de stock global.
 */
const TablaDepositoStock = () => {
    const {
        matrizStock,
        dataDepositosRaw,
        cargandoStock,
        busquedaStock,
        setBusquedaStock
    } = useDepositoUI();

    // Generación de columnas dinámicas siguiendo el patrón del proyecto
    const columnasStock = React.useMemo(() =>
        generarColumnasStock(dataDepositosRaw),
        [dataDepositosRaw]);

    return (
        <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--surface)] to-[var(--surface-hover)]/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 rounded-xl border border-[var(--primary)]/10 text-[var(--primary)]">
                        <ArcaIcono size={20} />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-black text-[var(--text-primary)] leading-tight">Matriz de Distribución</h2>
                        <p className="text-[12px] text-[var(--text-muted)] font-medium mt-0.5">Visibilidad global de productos por punto geográfico.</p>
                    </div>
                </div>
            </div>

            <div className="p-2 md:p-4">
                <DataTable
                    columnas={columnasStock}
                    datos={matrizStock}
                    mostrarBuscador={true}
                    busqueda={busquedaStock}
                    onBusquedaChange={setBusquedaStock}
                    placeholderBuscador="Filtrar productos..."
                    mostrarAcciones={false}
                    className="border-none shadow-none"
                    cargando={cargandoStock}
                />
            </div>
        </div>
    );
};

export default TablaDepositoStock;
