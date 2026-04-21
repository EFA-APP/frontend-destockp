import { memo } from "react";
import { VentasIcono, CheckIcono } from "../../../../assets/Icons";

const ResumenVentaMobile = ({
  items,
  totales,
  tabActiva,
  setTabActiva,
  handleFacturar,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="md:hidden fixed bottom-[64px] left-0 right-0 bg-[#111] border-t border-white/10 p-4 flex items-center justify-between z-[500] shadow-[0_-10px_30px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom duration-300">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">
          Total Venta
        </span>
        <span className="text-2xl font-black text-emerald-400 leading-none">
          ${totales.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {tabActiva === "productos" ? (
        <button
          onClick={() => setTabActiva("pago")}
          className="bg-white text-black px-6 py-3 rounded-xl font-black text-sm uppercase tracking-tighter flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition-transform"
        >
          Siguiente <VentasIcono size={18} />
        </button>
      ) : (
        <button
          onClick={handleFacturar}
          className="bg-[var(--primary)] text-black px-8 py-3 rounded-xl font-black text-sm uppercase tracking-tighter flex items-center gap-2 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] active:scale-95 transition-transform animate-pulse"
        >
          COBRAR <CheckIcono size={18} />
        </button>
      )}
    </div>
  );
};

export default memo(ResumenVentaMobile);
