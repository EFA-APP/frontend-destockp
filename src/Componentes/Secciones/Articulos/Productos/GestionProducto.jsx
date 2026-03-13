import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProductoUI } from "../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import { InventarioIcono, HistorialIcono, VentasIcono, ProduccionIcono, ComprobanteIcono, MovimientoIcono } from "../../../../assets/Icons";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import productoConfig from "../../../Modales/Articulos/ConfigProducto";
import ModalMovimiento from "../../../Modales/Articulos/ModalMovimiento";
import ModalProduccion from "../../../Modales/Articulos/ModalProduccion";
import ListaMovimientos from "../../../UI/ListaMovimientos/ListaMovimientos";

const GestionProducto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { productos, actualizarProducto, cargando } = useProductoUI();
    const [producto, setProducto] = useState(location.state?.producto || null);
    const [activeTab, setActiveTab] = useState(location.state?.tab || "info");

    useEffect(() => {
        if (!producto && productos.length > 0) {
            const found = productos.find(p => String(p.codigoSecuencial) === id);
            if (found) setProducto(found);
        }
    }, [id, productos, producto]);

    const tabs = [
        { id: "info", label: "Información", icon: <ComprobanteIcono size={16} /> },
        { id: "editar", label: "Editar", icon: <InventarioIcono size={16} /> },
        { id: "produccion", label: "Producción", icon: <ProduccionIcono size={16} /> },
        { id: "historial", label: "Historial", icon: <HistorialIcono size={16} /> },
    ];

    if (!producto && cargando) {
        return (
            <ContenedorSeccion className="flex items-center justify-center p-20">
                <div className="animate-pulse text-[var(--primary)] font-black uppercase tracking-widest">
                    Cargando Producto...
                </div>
            </ContenedorSeccion>
        );
    }

    if (!producto) {
        return (
            <ContenedorSeccion className="p-8">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center">
                    <p className="text-rose-500 font-black uppercase tracking-widest mb-2">Producto no encontrado</p>
                    <button onClick={() => navigate("/panel/inventario/productos")} className="text-white/60 hover:text-white underline font-bold mt-4">
                        Volver al listado
                    </button>
                </div>
            </ContenedorSeccion>
        );
    }

    return (
        <ContenedorSeccion className="px-3 py-2">
            <div className="card no-inset no-ring bg-[var(--surface)] shadow-md rounded-md! mb-4 overflow-hidden">
                <EncabezadoSeccion
                    ruta={`Producto: ${producto.nombre}`}
                    icono={<InventarioIcono size={18} />}
                    volver={true}
                    redireccionAnterior={"/panel/inventario/productos"}
                />
            </div>

            {/* Compact Formal Tab Navigation */}
            <div className="flex flex-wrap items-center gap-1.5 p-1! bg-black/20! border! border-white/5! rounded-t-md! backdrop-blur-md! self-start shadow-inner!">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group relative flex items-center gap-2 px-4 py-2 rounded-md! text-[9px] font-black uppercase tracking-[0.1em] transition-all! duration-500! overflow-hidden! cursor-pointer! ${activeTab === tab.id
                            ? "text-[var(--primary)]! bg-[var(--primary)]/10! border! border-[var(--primary)]/20! shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]!"
                            : "text-white/30! hover:text-white/70! hover:bg-white/[0.03]! border! border-transparent!"
                            }`}
                    >
                        <span className={`transition-transform! duration-500! scale-75 ${activeTab === tab.id ? "scale-90! text-[var(--primary)]!" : "group-hover:scale-90!"}`}>
                            {tab.icon}
                        </span>
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary)]! animate-in! slide-in-from-left! duration-500!" />
                        )}
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[var(--surface)] p-2 rounded-md">
                {/* Tab Content: INFO & EDIT */}
                {(activeTab === "info" || activeTab === "editar") && (
                    <div className="max-w-[720px] mx-auto">
                        <ModalDetalleGenerico
                            open={true}
                            accentColor="emerald"
                            isStandalone={true}
                            hideTabs={activeTab === "info"}
                            onClose={() => navigate("/panel/inventario/productos")}
                            mode={activeTab === "editar" ? "editar" : "view"}
                            data={producto}
                            {...productoConfig}
                            initialTab="info"
                            width="w-full"
                            onSave={async (dataEditada) => {
                                const {
                                    codigoSecuencial,
                                    codigoEmpresa,
                                    id,
                                    ...payload
                                } = dataEditada;

                                // Numerical types
                                if (payload.stock !== undefined) payload.stock = parseFloat(payload.stock) || 0;
                                if (payload.cantidadPorPaquete !== undefined) payload.cantidadPorPaquete = parseFloat(payload.cantidadPorPaquete) || 0;

                                // Boolean type
                                if (payload.activo !== undefined) payload.activo = !!payload.activo;

                                try {
                                    await actualizarProducto(producto.codigoSecuencial, payload);
                                    // Force redirect or update
                                    navigate("/panel/inventario/productos");
                                } catch (err) {
                                    console.error("Error updating product:", err);
                                }
                            }}
                        >
                            {activeTab === "editar" && (
                                <ListaMovimientos
                                    codigoArticulo={producto?.codigoSecuencial}
                                    tipoArticulo="PRODUCTO"
                                />
                            )}
                        </ModalDetalleGenerico>
                    </div>
                )}


                {activeTab === "produccion" && (
                    <div className="max-w-[720px] mx-auto">
                        <ModalProduccion
                            open={true}
                            onClose={() => setActiveTab("info")}
                            articulo={producto}
                            isStandalone={true}
                        />
                    </div>
                )}

                {activeTab === "historial" && (
                    <div className="max-w-[720px] mx-auto bg-transparent!">
                        <div className="flex items-center gap-2 mb-4 p-3 rounded-md! bg-zinc-900/30 border border-white/5 shadow-inner">
                            <div className="w-8 h-8 rounded-md! bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                <HistorialIcono size={16} color="var(--primary)" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Historial</h3>
                                <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Traza de operaciones</p>
                            </div>
                        </div>
                        <ListaMovimientos
                            codigoArticulo={producto?.codigoSecuencial}
                            tipoArticulo="PRODUCTO"
                        />
                    </div>
                )}
            </div>
        </ContenedorSeccion>
    );
};

export default GestionProducto;
