import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useObtenerProductos } from "../../../Backend/Articulos/queries/Producto/useObtenerProductos.query";
import { ProduccionIcono, BuscadorIcono, PaloDeAmasarIcono } from "../../../assets/Icons";
import { Hammer, Package, Search, ArrowRight } from "lucide-react";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ContenedorSeccion from "../../ContenidoPanel/ContenedorSeccion";

/**
 * ProduccionSeleccionPage: Interfaz para seleccionar que producto se va a producir.
 */
const ProduccionSeleccionPage = () => {
    const navigate = useNavigate();
    const { data: queryData, isLoading } = useObtenerProductos({});
    const [searchTerm, setSearchTerm] = useState("");

    const productos = useMemo(() => {
        return Array.isArray(queryData?.data) ? queryData.data : [];
    }, [queryData]);

    const filteredItems = useMemo(() => {
        const term = searchTerm.toLowerCase();
        if (!term) return productos;
        return productos.filter(item =>
            item.nombre?.toLowerCase().includes(term) ||
            String(item.codigoSecuencial).includes(term)
        );
    }, [searchTerm, productos]);

    return (
        <ContenedorSeccion>
            <EncabezadoSeccion
                ruta="Nueva Producción > Seleccionar Producto"
                icono={<ProduccionIcono size={20} />}
                volver={true}
                redireccionAnterior={-1}
            />

            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                {/* Search Header */}
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-500 transition-colors z-10">
                        <BuscadorIcono size={18} color="white" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar producto por nombre o código para iniciar producción..."
                        className="w-full bg-[var(--surface)] border border-white/10 rounded-md pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-purple-500/30 transition-all shadow-xl placeholder:text-white/10 font-medium"
                    />
                </div>

                {/* Grid of Products */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-24 bg-white/[0.02] border border-white/5 rounded-md animate-pulse" />
                        ))
                    ) : filteredItems.length === 0 ? (
                        <div className="col-span-full py-20 bg-white/[0.01] border border-dashed border-white/5 rounded-md flex flex-col items-center justify-center text-white/10">
                            <Package size={40} strokeWidth={1} className="mb-2 opacity-10" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No se encontraron productos</p>
                        </div>
                    ) : (
                        filteredItems.map((item) => (
                            <div
                                key={item.codigoSecuencial}
                                onClick={() => navigate(`/panel/inventario/produccion/${item.codigoSecuencial}`)}
                                className="group bg-[var(--surface)] border border-white/5 hover:border-purple-500/30 rounded-md p-4 flex items-center justify-between transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-purple-500/5 active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-md bg-purple-600/10 flex items-center justify-center text-purple-500 border border-purple-500/10 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                        <PaloDeAmasarIcono size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[9px] font-mono text-white/20 uppercase">#{item.codigoSecuencial.toString().padStart(3, '0')}</span>
                                            <div className="w-1 h-1 rounded-full bg-white/10" />
                                            <span className="text-[9px] font-black text-purple-500/50 uppercase tracking-widest">{item.unidadMedida}</span>
                                        </div>
                                        <h3 className="text-[13px] font-bold text-white uppercase group-hover:text-purple-400 transition-colors line-clamp-1">{item.nombre}</h3>
                                        <p className="text-[10px] text-white/30 font-medium">Stock Actual: <span className="text-white/60">{item.stock || 0}</span></p>
                                    </div>
                                </div>
                                <div className="p-2 rounded-md bg-white/5 text-white/20 group-hover:bg-purple-600/20 group-hover:text-purple-400 transition-all">
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Info */}
                <div className="bg-purple-600/5 border border-purple-500/10 rounded-md p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border border-purple-500/20 flex items-center justify-center bg-purple-500/10 text-purple-500">
                            <PaloDeAmasarIcono size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">Módulo de Manufactura</h4>
                            <p className="text-xs text-white/40 max-w-md">Seleccione un artículo terminado para desglosar sus insumos y registrar un nuevo lote en el inventario.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/panel/inventario/produccion/reporte")}
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em] transition-all cursor-pointer active:scale-95"
                    >
                        Ver Historial Completo
                    </button>
                </div>
            </div>
        </ContenedorSeccion>
    );
};

export default ProduccionSeleccionPage;
