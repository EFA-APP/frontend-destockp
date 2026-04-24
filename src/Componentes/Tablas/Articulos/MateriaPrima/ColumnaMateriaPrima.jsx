import { ArcaIcono } from "../../../../assets/Icons";

export const columnasMateriaPrima = (onAbrirDrawer) => [
  {
    key: "codigoSecuencial",
    etiqueta: "Cód.",
    filtrable: true,
    renderizar: (valor) => (
      <div className="flex items-center gap-2">
        <div className="font-mono text-[12px] font-black text-emerald-700 bg-emerald-700/10 px-2 py-1 rounded-md border border-emerald-700/20 shadow-sm tracking-tighter">
          #{String(valor).padStart(4, "0")}
        </div>
      </div>
    ),
  },
  {
    key: "nombre",
    etiqueta: "Materia Prima",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div className="py-2 group">
        <div className="flex items-center gap-2">
          <ArcaIcono
            size={14}
            className="text-emerald-700/50 group-hover:text-emerald-700 "
          />
          <div className="font-extrabold text-[15px] text-[var(--text-primary)] leading-tight uppercase tracking-tight group-hover:text-emerald-700 ">
            {valor}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] bg-[var(--surface-hover)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
            {fila.tipo || "GENÉRICO"}
          </span>
          {fila.unidadMedida && (
            <span className="text-[12px] text-[var(--text-muted)] font-medium opacity-70 italic">
              • Medido en {fila.unidadMedida}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "stock",
    etiqueta: "Stock Actual",
    filtrable: false,
    renderizar: (valor, fila) => {
      const getStockConfig = (val, unit) => {
        const threshold = unit?.toLowerCase() === "kg" ? 10 : 50;
        if (val > threshold * 3)
          return {
            color: "text-emerald-700",
            bg: "bg-emerald-700/10",
            border: "border-emerald-700/20",
            glow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
          };
        if (val > threshold)
          return {
            color: "text-amber-700",
            bg: "bg-amber-700/10",
            border: "border-amber-700/20",
            glow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]",
          };
        return {
          color: "text-rose-700",
          bg: "bg-rose-700/10",
          border: "border-rose-700/20",
          glow: "shadow-[0_0_15px_rgba(244,63,94,0.1)]",
        };
      };

      const config = getStockConfig(valor || 0, fila.unidadMedida);

      return (
        <div className="py-2">
          <div
            onClick={() => onAbrirDrawer && onAbrirDrawer(fila)}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border backdrop-blur-md ${config.bg} ${config.color} ${config.border} ${config.glow}   shadow-sm hover:scale-105 transform origin-left cursor-pointer`}
          >
            <span className="text-[14px] font-black tracking-tight">
              {valor || 0}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">
              {fila.unidadMedida || "UND"}
            </span>
          </div>

          {fila.cantidadPorPaquete && (
            <div className="mt-2 pl-1 border-l-2 border-emerald-700/20">
              <div className="text-[12px] text-[var(--text-muted)] font-bold italic opacity-80 flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-700/40" />
                Empaque:{" "}
                <span className="text-emerald-700/80">
                  {fila.cantidadPorPaquete} {fila.unidadMedida}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    },
  },
];
