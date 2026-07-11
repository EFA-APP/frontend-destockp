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
    arcaData ? "EGRESO" : (location.state?.tipoOperacion ?? "INGRESO")
  );

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-neutral-bg)] w-full p-3 md:p-6 text-[var(--color-neutral-text-main)] overflow-x-hidden">
      {/* TABS */}
      <div className="flex flex-wrap bg-white p-1.5 rounded-[12px] border border-[var(--color-neutral-border)] w-full sm:w-fit mb-6 shadow-sm gap-1">
        <button
          onClick={() => {
            setTipoOperacion("INGRESO");
          }}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-[8px] text-[13px] font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer ${
            tipoOperacion === "INGRESO"
              ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)]"
              : "text-[var(--color-neutral-text-muted)] hover:text-[var(--color-neutral-text-main)] hover:bg-gray-50"
          }`}
        >
          Ventas (Ingresos)
        </button>
        <button
          onClick={() => {
            setTipoOperacion("EGRESO");
          }}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-[8px] text-[13px] font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer ${
            tipoOperacion === "EGRESO"
              ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)]"
              : "text-[var(--color-neutral-text-muted)] hover:text-[var(--color-neutral-text-main)] hover:bg-gray-50"
          }`}
        >
          Compras (Egresos)
        </button>
        <button
          onClick={() => {
            setTipoOperacion("RECIBOS");
          }}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-[8px] text-[13px] font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer ${
            tipoOperacion === "RECIBOS"
              ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)]"
              : "text-[var(--color-neutral-text-muted)] hover:text-[var(--color-neutral-text-main)] hover:bg-gray-50"
          }`}
        >
          Recibos
        </button>
        <button
          onClick={() => {
            setTipoOperacion("ORDEN_PAGO");
          }}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-[8px] text-[13px] font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer ${
            tipoOperacion === "ORDEN_PAGO"
              ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)]"
              : "text-[var(--color-neutral-text-muted)] hover:text-[var(--color-neutral-text-main)] hover:bg-gray-50"
          }`}
        >
          Ordenes de Pago
        </button>
      </div>

      {/* CONTENEDORES */}
      <div className="mb-30">
        <div className="flex flex-col gap-5 min-h-[500px]">
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
