import React from "react";
import DataTable from "../../../UI/DataTable/DataTable";
import { ArcaIcono, CargandoIcono } from "../../../../assets/Icons";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import { generarColumnasStock } from "./ColumnasDepositoStock";
import { Package, Search, Database, ChevronRight } from "lucide-react";

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

    const columnasStock = React.useMemo(() =>
        generarColumnasStock(dataDepositosRaw),
        [dataDepositosRaw]);

    return (
        <div className="bg-[var(--surface)] border border-white/5 rounded-md shadow-2xl overflow-hidden">
            
            {/* Table Header */}
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-amber-500/10 rounded-md border border-amber-500/10 text-amber-500">
                        <Database size={18} />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-black text-white leading-tight uppercase tracking-tight">Matriz de Inventario</h2>
                        <p className="text-[12px] text-white/30 font-medium mt-0.5 uppercase tracking-widest">Distribución geográfica por artículo</p>
                    </div>
                </div>

                {/* Mobile Search - Integrated */}
                <div className="relative md:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                        type="text"
                        value={busquedaStock}
                        onChange={(e) => setBusquedaStock(e.target.value)}
                        placeholder="Filtrar por nombre o código..."
                        className="w-full bg-black/20 border border-white/10 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="p-0 md:p-4">
                {/* Desktop View: DataTable */}
                <div className="hidden md:block">
                    <DataTable
                        columnas={columnasStock}
                        datos={matrizStock}
                        mostrarBuscador={false} // Custom search above
                        placeholderBuscador="Filtrar productos..."
                        mostrarAcciones={false}
                        className="border-none shadow-none"
                        cargando={cargandoStock}
                    />
                </div>

                {/* Mobile View: Card List */}
                <div className="md:hidden">
                    {cargandoStock ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <CargandoIcono size={32} className="animate-spin text-amber-500/40" />
                            <span className="text-[11px] text-white/20 font-bold uppercase tracking-widest">Sincronizando Stock...</span>
                        </div>
                    ) : matrizStock.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {matrizStock.map((row, idx) => (
                                <div key={idx} className="p-5 active:bg-white/[0.02] transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono text-white/20 mb-1">#{row.codigoSecuencial?.toString().padStart(3, '0') || '000'}</span>
                                            <span className="text-[14px] font-black text-white leading-tight tracking-tight uppercase">
                                                {row.nombreArticulo}
                                            </span>
                                        </div>
                                        <div className="px-2 py-1 bg-white/5 rounded border border-white/5 text-[10px] font-black text-white/40 uppercase">
                                            {row.unidadMedida}
                                        </div>
                                    </div>
                                    
                                    {/* Stock Grid for this product */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {columnasStock.filter(col => col.key !== 'codigoSecuencial' && col.key !== 'nombreArticulo' && col.key !== 'unidadMedida').map((col, cIdx) => (
                                            <div key={cIdx} className="bg-white/[0.03] border border-white/5 rounded p-3 flex flex-col gap-1">
                                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest truncate">{col.header}</span>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[13px] font-black ${row[col.key] > 0 ? 'text-white' : 'text-white/20'}`}>
                                                        {row[col.key]}
                                                    </span>
                                                    {row[col.key] > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center opacity-20">
                            <Package size={48} strokeWidth={1} />
                            <span className="text-xs font-bold mt-4">NO SE ENCONTRARON PRODUCTOS</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TablaDepositoStock;
