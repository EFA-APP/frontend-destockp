import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useObtenerProductos } from "../../../../Backend/Articulos/queries/Producto/useObtenerProductos.query";
import { EditarIcono, BuscadorIcono, InventarioIcono } from "../../../../assets/Icons";
import { ArrowRight, Package } from "lucide-react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";

/**
 * SeleccionarProductoGestionPage: Interfaz para seleccionar que PRODUCTO se va a editar.
 */
const SeleccionarProductoGestionPage = () => {
    const navigate = useNavigate();
    const { data: prodData, isLoading } = useObtenerProductos({});
    const [searchTerm, setSearchTerm] = useState("");

    const items = useMemo(() => {
        return (Array.isArray(prodData?.data) ? prodData.data : []);
    }, [prodData]);

    const filteredItems = useMemo(() => {
        const term = searchTerm.toLowerCase();
        if (!term) return items;
        return items.filter(item =>
            item.nombre?.toLowerCase().includes(term) ||
            String(item.codigoSecuencial).includes(term)
        );
    }, [searchTerm, items]);

    return (
        <ContenedorSeccion>
            <EncabezadoSeccion
                ruta="Gestión de Artículos > Seleccionar Producto"
                icono={<EditarIcono size={20} />}
                volver={true}
                redireccionAnterior={-1}
            />

            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/85 group-focus-within:text-blue-500 transition-colors z-10">
                        <BuscadorIcono size={18} color="white" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar producto por nombre o código para gestionar..."
                        className="w-full bg-[var(--surface)] border border-white/10 rounded-md pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-blue-500/30 transition-all shadow-xl placeholder:text-white/10 font-medium"
                    />
                </div>

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
                                onClick={() => navigate(`/panel/inventario/productos/${item.codigoSecuencial}/editar`, { state: { producto: item } })}
                                className="group bg-[var(--surface)] border border-white/5 rounded-md p-4 flex items-center justify-between transition-all duration-300 cursor-pointer hover:shadow-lg hover:border-amber-500/30 hover:shadow-amber-500/5 active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-md bg-amber-600/10 text-amber-500 border border-amber-500/10 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-all">
                                        <InventarioIcono size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[9px] font-mono text-white/85 uppercase">#{item.codigoSecuencial.toString().padStart(3, '0')}</span>
                                            <div className="w-1 h-1 rounded-full bg-white/10" />
                                            <span className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest">PRODUCTO</span>
                                        </div>
                                        <h3 className="text-[13px] font-bold text-white uppercase transition-colors line-clamp-1 group-hover:text-white">{item.nombre}</h3>
                                        <p className="text-[10px] text-white/85 font-medium">Stock: <span className="text-white/60">{item.stock || 0}</span> {item.unidadMedida}</p>
                                    </div>
                                </div>
                                <div className="p-2 rounded-md bg-white/5 text-white/85 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </ContenedorSeccion>
    );
};

export default SeleccionarProductoGestionPage;
