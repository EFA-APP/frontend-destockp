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
import { Building2 } from "lucide-react";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import TarjetaDeposito from "./TarjetaDeposito.jsx";
import TablaDepositoStock from "../../../Tablas/Articulos/Deposito/TablaDepositoStock";
import StockDepositoPDF from "../../../Reportes/StockDepositoPDF.jsx";

/**
 * Componente Deposito: Gestión de sucursales y stock global.
 */
const Deposito = () => {
    const {
        depositos,
        matrizStock,
        cargando,
    } = useDepositoUI();
    const navigate = useNavigate();

    const handleNuevaSucursal = () => {
        navigate("/panel/inventario/depositos/nuevo");
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
        </ContenedorSeccion>
    );
};

export default Deposito;
