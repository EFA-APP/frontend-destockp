import Ingresos from "../Tabs/Ingresos";
import Egresos from "../Tabs/Egresos";
import { useTabsComprobante } from "../../../../Backend/Comprobantes/useTabsComprobante";

const CrearComprobante = () => {
  const { tipoOperacion, setTipoOperacion } = useTabsComprobante();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] w-full p-3 md:p-6 text-gray-800 font-sans overflow-x-hidden">
      {/* TABS */}
      <div className="flex bg-gray-200/60 p-1.5 rounded-md border border-gray-200 w-full sm:w-fit mb-6 shadow-inner">
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
      </div>

      {/* CONTENEDORES */}
      <div className="flex-1 flex flex-col gap-6 mb-30">
        <div className="bg-gray-200 rounded-md border border-gray-200/80 p-5 md:p-1 shadow-xl shadow-gray-100/50 flex flex-col gap-5 min-h-[500px]">
          {tipoOperacion === "INGRESO" ? (
            <Ingresos tipoOperacion={tipoOperacion} />
          ) : (
            <Egresos tipoOperacion={tipoOperacion} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CrearComprobante;
