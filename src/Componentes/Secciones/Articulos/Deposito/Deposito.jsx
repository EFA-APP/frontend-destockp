import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import {
    AgregarIcono,
    VentasIcono,
    UbicacionIcono,
    DescargarIcono,
} from "../../../../assets/Icons";
import { Building2, Trash2 } from "lucide-react";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import TarjetaDeposito from "./TarjetaDeposito.jsx";
import TablaDepositoStock from "../../../Tablas/Articulos/Deposito/TablaDepositoStock";
import StockDepositoPDF from "../../../Reportes/StockDepositoPDF.jsx";

/**
 * Componente Deposito: Gestión de sucursales y stock global.
 */
const Deposito = () => {
    const [depositoAEliminar, setDepositoAEliminar] = useState(null);
    const [borrarStock, setBorrarStock] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const {
        depositos,
        matrizStock,
        cargando,
        eliminarDeposito,
    } = useDepositoUI();
    const navigate = useNavigate();

    const handleNuevaSucursal = () => {
        navigate("/panel/inventario/depositos/nuevo");
    };

    const handleEliminarSucursal = async (suc) => {
        setDepositoAEliminar(suc);
    };

    const handleConfirmarEliminar = async () => {
        if (!depositoAEliminar) return;
        setProcesando(true);
        try {
            await eliminarDeposito(depositoAEliminar.codigoSecuencial, borrarStock);
            setDepositoAEliminar(null);
            setBorrarStock(false);
        } catch (e) {
            // Error se muestra en Alertas
        } finally {
            setProcesando(false);
        }
    };

    const handleEditarSucursal = (suc) => {
        navigate(`/panel/inventario/depositos/editar?codigoSecuencial=${suc.codigoSecuencial}`);
    };

    return (
        <ContenedorSeccion className="px-3 py-2">
            {/* Header / Navigation Card */}
            <div className="card no-inset no-ring bg-[var(--surface)] shadow-md rounded-md! mb-6 overflow-hidden">
                <EncabezadoSeccion
                    ruta={"Inventario > Depósitos   "}
                    icono={<Building2 size={18} />}
                />
            </div>

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
                {/* Warehouse Grid Section */}
                <section>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="flex items-center gap-2.5 text-[var(--surface)]">
                            <UbicacionIcono size={14} color="var(--primary-light)" />
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                                DEPOSITOS
                            </h4>
                        </div>
                        <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-white/10 to-transparent" />
                        <button
                            onClick={handleNuevaSucursal}
                            className="flex items-center gap-2.5 px-4 py-2 bg-[var(--primary)] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-md shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer group"
                        >
                            <AgregarIcono size={10} className="group-hover:rotate-90 transition-transform duration-500" />
                            Nuevo Depósito
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {cargando ? (
                            [1, 2, 3, 4].map(n => (
                                <div key={n} className="h-44 rounded-md bg-[var(--surface)] border border-white/5 animate-pulse" />
                            ))
                        ) : (
                            depositos.map((suc) => (
                                <TarjetaDeposito
                                    key={suc.codigoSecuencial}
                                    suc={suc}
                                    onEdit={handleEditarSucursal}
                                    onDelete={handleEliminarSucursal}
                                />
                            ))
                        )}
                    </div>
                </section>

                {/* Stock Matrix Section */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2.5">
                            <VentasIcono size={14} color="var(--primary-light)" />
                            Inventario de Depósitos
                        </h4>
                        <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-white/10 to-transparent" />

                        {/* PDF Download Button */}
                        <PDFDownloadLink
                            document={<StockDepositoPDF matrizStock={matrizStock} depositos={depositos} />}
                            fileName={`Reporte_Stock_${new Date().toLocaleDateString()}.pdf`}
                        >
                            {({ loading }) => (
                                <button
                                    disabled={loading || cargando}
                                    className="flex items-center gap-2.5 px-4 py-2 bg-white/5 hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-md font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer active:scale-95 group/pdf disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <DescargarIcono size={20} className="group-hover:rotate-90 transition-transform duration-500" />

                                    {loading ? 'Preparando...' : 'Descargar Reporte'}
                                </button>
                            )}
                        </PDFDownloadLink>
                    </div>
                    <TablaDepositoStock />
                </section>
            </div>

            {/* Modal de Confirmación para Eliminar */}
            {depositoAEliminar && (
                <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[var(--surface)] border border-white/10 rounded-md max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                                <Trash2 className="text-red-400" size={24} />
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">
                                ¿Eliminar Depósito?
                            </h3>
                            <p className="text-sm text-white/60 mb-6">
                                Esta acción eliminará el depósito <strong className="text-white">{depositoAEliminar.nombre}</strong> y todo su historial de stock local.
                            </p>

                            {/* Checkbox para borrar stock general */}
                            <label className="flex items-center gap-3 w-full bg-white/5 p-4 rounded-md border border-white/5 hover:border-white/10 transition-all cursor-pointer mb-6 group/check">
                                <input
                                    type="checkbox"
                                    checked={borrarStock}
                                    onChange={(e) => setBorrarStock(e.target.checked)}
                                    className="rounded border-white/20 bg-black/40 text-[var(--primary)] focus:ring-[var(--primary)]/20 cursor-pointer"
                                />
                                <div className="text-left">
                                    <span className="text-xs font-bold text-white block group-hover/check:text-[var(--primary)] transition-colors">
                                        ¿Limpiar stock productos?
                                    </span>
                                    <span className="text-[10px] text-white/40 block mt-0.5">
                                        Si activas esto, se reseteará a 0 el stock global de todos los productos.
                                    </span>
                                </div>
                            </label>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => {
                                        setDepositoAEliminar(null);
                                        setBorrarStock(false);
                                    }}
                                    disabled={procesando}
                                    className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmarEliminar}
                                    disabled={procesando}
                                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer shadow-lg shadow-red-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {procesando ? "Borrando..." : "Confirmar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ContenedorSeccion>
    );
};

export default Deposito;
