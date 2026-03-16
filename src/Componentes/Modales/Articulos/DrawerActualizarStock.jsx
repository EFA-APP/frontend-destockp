import React, { useState, useEffect } from "react";
import { Package, X, Database, TrendingUp, TrendingDown, Info, ArrowRight } from "lucide-react";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useActualizarStock } from "../../../Backend/Articulos/queries/Deposito/useActualizarStock.mutation";
import { InventarioIcono } from "../../../assets/Icons";

const DrawerActualizarStock = ({ isOpen, onClose, fila, depositosRaw, depositoInicial }) => {
    const [depositoSeleccionado, setDepositoSeleccionado] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [tipoAjuste, setTipoAjuste] = useState("agregar"); // 'agregar' o 'quitar'
    const [observacion, setObservacion] = useState("");
    
    const { mutate: actualizarStock, isPending } = useActualizarStock();
    const usuario = useAuthStore((state) => state.usuario);

    // Init state on load
    useEffect(() => {
        if (isOpen) {
            setDepositoSeleccionado(depositoInicial || depositosRaw?.[0]?.codigoSecuencial?.toString() || "");
            setCantidad("");
            setTipoAjuste("agregar");
            setObservacion("");
            // Bloquear scroll del body
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen, depositosRaw, depositoInicial]);

    if (!isOpen || !fila) return null;

    const stockActualCalculado = Number(fila[`${depositoSeleccionado}`]) || 0;
    const proximoStock = cantidad ? (tipoAjuste === 'agregar' ? stockActualCalculado + Number(cantidad) : stockActualCalculado - Number(cantidad)) : stockActualCalculado;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!depositoSeleccionado || !cantidad) return;

        let cantidadFinal = Number(cantidad);
        if (tipoAjuste === "quitar") {
            cantidadFinal = -Math.abs(cantidadFinal); // Negativo
        } else {
            cantidadFinal = Math.abs(cantidadFinal); // Positivo
        }

        console.log(fila);

        actualizarStock(
            {
                codigoProducto: Number(fila.codigoProducto),
                codigoDeposito: Number(depositoSeleccionado),
                cantidad: cantidadFinal,
                codigoUsuario: usuario?.codigoSecuencial,
                nombreUsuario: `${usuario?.nombre || ""} ${usuario?.apellido || ""}`.trim(),
                observacion: observacion || undefined,
                generarMovimiento: true
            },
            {
                onSuccess: () => {
                    onClose();
                }
            }
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Overlay background (blur) */}
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={!isPending ? onClose : undefined}
            />

            {/* Slide-over panel */}
            <div className={`
                relative w-full max-w-md h-full bg-[var(--surface-active)] shadow-[-10px_0_30px_max(rgba(0,0,0,0.5))] 
                border-l border-[var(--border-subtle)] flex flex-col
                transform transition-transform duration-400 cubic-bezier(0.16, 1, 0.3, 1)
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                
                {/* Header Premium */}
                <div className="px-6 py-5 border-b border-[var(--border-subtle)] bg-white/[0.02] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                            <InventarioIcono size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[16px] font-black text-white leading-tight uppercase tracking-tight">{fila.nombre}</p>
                            <h2 className="text-[11px] text-[var(--primary-light)] font-medium uppercase tracking-widest mt-0.5">Ajuste de Stock</h2>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        disabled={isPending}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Body scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">

                    <form id="stock-drawer-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                        
                        {/* Selector de Depósito Estilizado */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                <Database size={14} className="text-amber-500/70" />
                                Depósito de Destino
                            </label>
                            <div className="relative group">
                                <select 
                                    value={depositoSeleccionado}
                                    onChange={(e) => setDepositoSeleccionado(e.target.value)}
                                    disabled={isPending}
                                    className="w-full h-12 bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 text-[14px] font-medium text-white focus:outline-none focus:border-amber-500/50 appearance-none transition-all group-hover:border-white/20"
                                >
                                    <option value="" disabled className="bg-[var(--surface)] text-white/50">Seleccione un depósito...</option>
                                    {depositosRaw?.map(dep => (
                                        <option key={dep.codigoSecuencial} value={dep.codigoSecuencial} className="bg-[var(--surface)] text-white">
                                            {dep.nombre}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronDown size={16} className="text-white/30" />
                                </div>
                            </div>
                        </div>

                        {/* Tipo de Ajuste (Toggles Anchos) */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">
                                Tipo de Ajuste
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTipoAjuste("agregar")}
                                    className={`
                                        flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 relative overflow-hidden
                                        ${tipoAjuste === "agregar" 
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                            : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5 hover:border-white/10"
                                        }
                                    `}
                                >
                                    {tipoAjuste === "agregar" && <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500" />}
                                    <TrendingUp size={22} className="mb-1.5" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Aumentar</span>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setTipoAjuste("quitar")}
                                    className={`
                                        flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 relative overflow-hidden
                                        ${tipoAjuste === "quitar" 
                                            ? "bg-red-500/10 border-red-500/30 text-red-400" 
                                            : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5 hover:border-white/10"
                                        }
                                    `}
                                >
                                    {tipoAjuste === "quitar" && <div className="absolute inset-x-0 top-0 h-0.5 bg-red-500" />}
                                    <TrendingDown size={22} className="mb-1.5" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Disminuir</span>
                                </button>
                            </div>
                        </div>

                        {/* Cantidad Input Enorme */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 flex justify-between items-end">
                                <span>Cantidad a Modificar</span>
                            </label>
                            <div className="relative flex items-center justify-center bg-black/40 border border-white/10 rounded-xl p-2 transition-all focus-within:border-amber-500/50">
                                <div className={`px-4 text-3xl font-black ${tipoAjuste === 'agregar' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {tipoAjuste === 'agregar' ? '+' : '-'}
                                </div>
                                <input 
                                    type="number" 
                                    value={cantidad}
                                    onChange={(e) => setCantidad(e.target.value)}
                                    step="1"
                                    placeholder="0"
                                    disabled={isPending}
                                    className="w-full bg-transparent text-center text-[25px] font-black text-white focus:outline-none py-4 placeholder:text-white/10"
                                />
                                <div className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/20 select-none">
                                    {fila.unidadMedida || 'UNI'}
                                </div>
                            </div>
                        </div>

                        {/* Previsualización del cálculo si seleccionó cantidad */}
                        {depositoSeleccionado && cantidad && (
                            <div className="flex items-center justify-center gap-4 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                                <div className="flex items-center gap-1 ">
                                    <span className="text-[10px] uppercase font-bold text-white">Actual:</span>
                                    <span className="text-[14px] font-black text-[var(--primary-light)]">{stockActualCalculado}</span>
                                </div>
                                <ArrowRight size={14} className="text-blue-500" />
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] uppercase font-bold text-white/60">Final:</span>
                                    <span className={`text-[16px] font-black ${proximoStock < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {proximoStock}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Observación */}
                        <div className="space-y-2 pt-2">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                <Info size={14} className="text-white/30" />
                                Observación (Opcional)
                            </label>
                            <textarea 
                                value={observacion}
                                onChange={(e) => setObservacion(e.target.value)}
                                placeholder="Motivos del remito, roturas, etc..."
                                disabled={isPending}
                                rows={2}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                            />
                        </div>

                    </form>
                </div>

                {/* Footer Flotante Interno */}
                <div className="p-6 md:pb-6 pb-20 border-t border-[var(--border-subtle)] bg-black/40 shrink-0">
                    <button 
                        type="submit" 
                        form="stock-drawer-form"
                        disabled={isPending || !depositoSeleccionado || !cantidad}
                        className={`
                            w-full h-14 rounded-xl text-[13px] font-black uppercase tracking-[0.1em] text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-xl border
                            ${!depositoSeleccionado || !cantidad 
                                ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed hidden-shadow' 
                                : tipoAjuste === 'agregar' 
                                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:to-emerald-400 border-emerald-500/50 shadow-[0_5px_20px_rgba(16,185,129,0.3)]' 
                                    : 'bg-gradient-to-r from-red-600 to-red-500 hover:to-red-400 border-red-500/50 shadow-[0_5px_20px_rgba(239,68,68,0.3)]'
                            }
                        `}
                    >
                        {isPending ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Ejecutando Ajuste...</span>
                            </>
                        ) : (
                            <span>{tipoAjuste === 'agregar' ? 'Confirmar Ingreso' : 'Confirmar Egreso'}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Necesario si usamos ChevronDown inline y no lo importamos arriba
function ChevronDown(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    );
}

export default DrawerActualizarStock;
