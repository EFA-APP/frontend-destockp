import React from "react";
import DataTable from "../../../UI/DataTable/DataTable";
import { ArcaIcono, CargandoIcono } from "../../../../assets/Icons";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import { generarColumnasStock } from "./ColumnasDepositoStock";
import { Package, Search, Database, ChevronRight } from "lucide-react";

import DrawerActualizarStock from "../../../Modales/Articulos/DrawerActualizarStock";

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

    const [drawerData, setDrawerData] = React.useState({ isOpen: false, fila: null, depositoInicial: null });

    const handleAbrirDrawer = (fila, depositoId = null) => {
        setDrawerData({ isOpen: true, fila, depositoInicial: depositoId });
    };

    const cerrarDrawer = () => {
        setDrawerData({ isOpen: false, fila: null, depositoInicial: null });
    };

    const matrizConAcciones = React.useMemo(() => 
        matrizStock.map(fila => ({
            ...fila,
            onActualizarStock: handleAbrirDrawer
        })),
    [matrizStock]);

    const columnasStock = React.useMemo(() =>
        generarColumnasStock(dataDepositosRaw),
    [dataDepositosRaw]);


    return (
        <React.Fragment>
            <div className="bg-[var(--surface)] border border-white/5 rounded-md shadow-2xl overflow-hidden">
                
                {/* Table Header */}
                <div className="px-4 py-4 md:px-6 md:py-5 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                            datos={matrizConAcciones} // <--- FIX: Usar matriz con handlers
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
                            <div className="flex flex-col gap-3 p-4 pb-24">
                                {matrizConAcciones.map((row, idx) => (
                                    <div key={idx} className="relative p-5 bg-[#121212] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                                        {/* Decorative glow */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                                        
                                        <div className="relative z-10">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-5">
                                                <div className="flex gap-3.5 items-center">
                                                    <div className="w-11 h-11 rounded-md bg-white/5 flex items-center justify-center border border-white/10 shrink-0 shadow-inner">
                                                        <Package size={20} className="text-white/50 drop-shadow-md" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-mono font-black text-amber-500/90 px-1.5 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/20 shadow-sm">
                                                            #{row.id?.toString().padStart(3, '0') || '000'}
                                                        </span>
                                                            <span className="text-[9px] font-black text-white/50 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5 shadow-sm">
                                                                {row.unidadMedida}
                                                            </span>
                                                        </div>
                                                        <span className="text-[15px] font-black text-white leading-tight tracking-tight uppercase drop-shadow-sm">
                                                            {row.nombreArticulo}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Stock Breakdown */}
                                            <div className="bg-black/40 rounded-xl border border-white/5 p-1.5 flex flex-col gap-1 shadow-inner">
                                                {columnasStock.filter(col => col.key !== 'codigoSecuencial' && col.key !== 'nombreArticulo' && col.key !== 'unidadMedida' && col.key !== 'acciones_stock').map((col, cIdx) => (
                                                    <div 
                                                        key={cIdx}
                                                        onClick={() => {
                                                            const depId = col.key.startsWith('dep_') ? col.key.split('_')[1] : null;
                                                            if(depId) row.onActualizarStock(row, depId);
                                                        }}
                                                        className={`group flex items-center justify-between p-3.5 rounded-lg cursor-pointer transition-all duration-200 active:scale-[0.98] ${row[col.key] > 0 ? 'bg-white/[0.04] hover:bg-white/10 hover:shadow-lg hover:border-amber-500/30 border border-white/5 shadow-sm' : 'hover:bg-white/10 hover:border-white/20 border border-transparent'}`}
                                                    >
                                                        <div className="flex items-center gap-3 w-full">
                                                            <div className={`w-2 h-2 rounded-full shrink-0 transition-colors ${row[col.key] > 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover:bg-amber-400 group-hover:shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'bg-white/10 group-hover:bg-white/30'}`} />
                                                            <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest truncate max-w-[120px] group-hover:text-white transition-colors">
                                                                {col.etiqueta || col.header}
                                                            </span>
                                                            <div className="flex-grow border-b border-dashed border-white/10 group-hover:border-white/30 mx-2 transition-colors"></div>
                                                            <span className={`text-[14px] font-black shrink-0 transition-colors ${row[col.key] > 0 ? 'text-white group-hover:text-amber-400' : 'text-white/20 group-hover:text-white/60'}`}>
                                                                {row[col.key] || 0}
                                                            </span>
                                                            <ChevronRight size={14} className="text-white/10 shrink-0 ml-1 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
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

            <DrawerActualizarStock
                isOpen={drawerData.isOpen}
                onClose={cerrarDrawer}
                fila={drawerData.fila}
                depositosRaw={dataDepositosRaw}
                depositoInicial={drawerData.depositoInicial}
            />
        </React.Fragment>
    );
};

export default TablaDepositoStock;
