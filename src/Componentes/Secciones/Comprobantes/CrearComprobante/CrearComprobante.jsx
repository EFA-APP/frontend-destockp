import { useState } from "react";
import { useLocation } from "react-router-dom";
import { RotateCcw, PlusCircle } from "lucide-react";
import Ingresos from "../Tabs/Ingresos";
import Egresos from "../Tabs/Egresos";
import Recibos from "../Tabs/Recibos";
import OrdenPago from "../Tabs/OrdenPago";
import { useTabsComprobante } from "../../../../Backend/Comprobantes/useTabsComprobante";

const CrearComprobante = () => {
  const location = useLocation();
  const arcaData = location.state?.arcaData ?? null;
  const [formKey, setFormKey] = useState(Date.now());

  const { tipoOperacion, setTipoOperacion } = useTabsComprobante(
    arcaData ? "EGRESO" : (location.state?.tipoOperacion ?? "INGRESO"),
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-8 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            <span>Comprobantes</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Nuevo Comprobante</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <PlusCircle
              className="text-gray-900"
              size={28}
              strokeWidth={2.5}
              color="var(--primary)"
            />
            Emisión de Comprobantes
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            Generá facturas de venta, compras, recibos de cobro y órdenes de
            pago.
          </p>
        </div>
        <button
          onClick={() => setFormKey(Date.now())}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
        >
          <RotateCcw size={16} strokeWidth={2.5} />
          Limpiar Formulario
        </button>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap bg-white p-1 rounded-md border border-gray-200 w-full sm:w-fit shadow-sm gap-1">
        <button
          onClick={() => setTipoOperacion("INGRESO")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            tipoOperacion === "INGRESO"
              ? "bg-gray-900 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Ventas (Ingresos)
        </button>
        <button
          onClick={() => setTipoOperacion("EGRESO")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            tipoOperacion === "EGRESO"
              ? "bg-gray-900 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Compras (Egresos)
        </button>
        <button
          onClick={() => setTipoOperacion("RECIBOS")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            tipoOperacion === "RECIBOS"
              ? "bg-gray-900 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Recibos
        </button>
        <button
          onClick={() => setTipoOperacion("ORDEN_PAGO")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            tipoOperacion === "ORDEN_PAGO"
              ? "bg-gray-900 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Ordenes de Pago
        </button>
      </div>

      {/* CONTENEDORES */}
      <div key={formKey} className="flex flex-col gap-5 min-h-[500px]">
        {tipoOperacion === "INGRESO" && <Ingresos tipoOperacion="INGRESO" />}
        {tipoOperacion === "EGRESO" && (
          <Egresos tipoOperacion="EGRESO" arcaData={arcaData} />
        )}
        {tipoOperacion === "RECIBOS" && <Recibos />}
        {tipoOperacion === "ORDEN_PAGO" && <OrdenPago />}
      </div>
    </div>
  );
};

export default CrearComprobante;
