import { InventarioIcono } from "../../../../assets/Icons";

export const columnasProductos = [
  {
    key: "codigoSecuencial",
    etiqueta: "Cód.",
    filtrable: true,
    renderizar: (valor) => (
      <div className="flex items-center gap-2">
        <div className="font-mono text-[12px] font-black text-amber-700 px-2 py-1 rounded-md border border-amber-700 shadow-sm tracking-tighter">
          #{String(valor).padStart(4, "0")}
        </div>
      </div>
    ),
  },
  {
    key: "nombre",
    etiqueta: "Producto",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div className="py-2">
        <div className="flex items-center gap-2">
          <InventarioIcono size={14} className="text-amber-700/50  " />
          <div className="font-extrabold text-[15px] text-[var(--text-primary)] leading-tight uppercase tracking-tight">
            {valor}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] bg-[var(--surface-hover)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
            {fila.unidadMedida || "UND"}
          </span>
          {fila.descripcion && (
            <span className="text-[12px] text-[var(--primary)] truncate max-w-[150px] font-medium opacity-70">
              • {fila.descripcion}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "stock",
    etiqueta: "Stock",
    filtrable: false,
    renderizar: (valor, fila) => {
      const getStockConfig = (val) => {
        if (val > 50)
          return {
            color: "text-emerald-700",
            bg: "bg-emerald-700/10",
            border: "border-emerald-700/20",
            glow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
          };
        if (val > 20)
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

      const config = getStockConfig(valor || 0);

      return (
        <div className="py-2">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border backdrop-blur-md ${config.bg} ${config.color} ${config.border} ${config.glow}  `}
          >
            <span className="text-[14px] font-black tracking-tight">
              {valor || 0}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">
              {fila.unidadMedida}
            </span>
          </div>

          {fila.cantidadPorPaquete > 0 && (
            <div className="mt-2 pl-1 border-l-2 border-[var(--border-subtle)] space-y-1">
              <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] font-bold italic opacity-80">
                <div className="w-1 h-1 rounded-full bg-amber-700/40" />
                Packs:{" "}
                <span className="text-black">
                  <span className="text-amber-700">
                    {fila.cantidadDePaquetesActuales}
                  </span>{" "}
                  de{" "}
                  <span className="text-amber-700">
                    {fila.cantidadPorPaquete}
                  </span>{" "}
                  und.
                </span>
              </div>
              {fila.cantidadSobrante > 0 && (
                <div className="flex items-center gap-1.5 text-[12px] text-amber-700/70 font-bold italic">
                  <div className="w-1 h-1 rounded-full bg-amber-700/60 " />
                  <span className="text-[var(--text-muted)] ">
                    Sobrante:
                  </span>{" "}
                  <span>{fila.cantidadSobrante} und.</span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
  },
];
