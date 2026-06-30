import { useLocation } from "react-router-dom";
import Ingresos from "../Tabs/Ingresos";
import Egresos from "../Tabs/Egresos";
import Recibos from "../Tabs/Recibos";
import OrdenPago from "../Tabs/OrdenPago";
import { useTabsComprobante } from "../../../../Backend/Comprobantes/useTabsComprobante";

const CrearComprobante = () => {
  const location = useLocation();
  const arcaData = location.state?.arcaData ?? null;

  const { tipoOperacion, setTipoOperacion } = useTabsComprobante(
    arcaData ? "EGRESO" : "INGRESO"
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] w-full p-3 md:p-6 text-gray-800 font-sans overflow-x-hidden">
      {/* TABS */}
      <div className="flex flex-wrap bg-gray-200/60 p-1.5 rounded-md border border-gray-200 w-full sm:w-fit mb-6 shadow-inner gap-1">
        <button
          onClick={() => {
            setTipoOperacion("INGRESO");
          }}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            tipoOperacion === "INGRESO"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
              : "text-gray-500 hover:text-gray-850 hover:bg-gray-105/50"
          }`}
        >
          Ventas (Ingresos)
        </button>
        <button
          onClick={() => {
            setTipoOperacion("EGRESO");
          }}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            tipoOperacion === "EGRESO"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
              : "text-gray-500 hover:text-gray-850 hover:bg-gray-105/50"
          }`}
        >
          Compras (Egresos)
        </button>
        <button
          onClick={() => {
            setTipoOperacion("RECIBOS");
          }}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            tipoOperacion === "RECIBOS"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
              : "text-gray-500 hover:text-gray-850 hover:bg-gray-105/50"
          }`}
        >
          Recibos
        </button>
        <button
          onClick={() => {
            setTipoOperacion("ORDEN_PAGO");
          }}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            tipoOperacion === "ORDEN_PAGO"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
              : "text-gray-500 hover:text-gray-850 hover:bg-gray-105/50"
          }`}
        >
          Ordenes de Pago
        </button>
      </div>

      {/* CONTENEDORES */}
      <div className="mb-30">
        <div className=" md:bg-gray-200 md:rounded-md md:p-5 md:shadow-xl shadow-gray-100/50 flex flex-col gap-5 min-h-[500px]">
          {tipoOperacion === "INGRESO" && <Ingresos tipoOperacion="INGRESO" />}
          {tipoOperacion === "EGRESO" && <Egresos tipoOperacion="EGRESO" arcaData={arcaData} />}
          {tipoOperacion === "RECIBOS" && <Recibos />}
          {tipoOperacion === "ORDEN_PAGO" && <OrdenPago />}
        </div>
      </div>
    </div>
  );
};

export default CrearComprobante;
