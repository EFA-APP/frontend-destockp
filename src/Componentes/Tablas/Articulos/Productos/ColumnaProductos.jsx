import { InventarioIcono } from "../../../../assets/Icons";

export const columnasProductos = [
  {
    key: "codigoSecuencial",
    etiqueta: "Cód.",
    filtrable: true,
    renderizar: (valor) => (
      <div className="flex items-center gap-2">
        <div className="font-mono text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 shadow-sm tracking-tighter">
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
      <div className="py-2 group">
        <div className="flex items-center gap-2">
          <InventarioIcono
            size={14}
            className="text-amber-500/50 group-hover:text-amber-500 transition-colors"
          />
          <div className="font-extrabold text-[13px] text-[var(--text-primary)] leading-tight uppercase tracking-tight group-hover:text-[var(--primary)] transition-colors">
            {valor}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] bg-[var(--surface-hover)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
            {fila.unidadMedida || "FRASCO"}
          </span>
          {fila.descripcion && (
            <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[150px] font-medium opacity-70">
              • {fila.descripcion}
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
      const getStockConfig = (val) => {
        if (val > 50)
          return {
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            glow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
          };
        if (val > 20)
          return {
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            glow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]",
          };
        return {
          color: "text-rose-500",
          bg: "bg-rose-500/10",
          border: "border-rose-500/20",
          glow: "shadow-[0_0_15px_rgba(244,63,94,0.1)]",
        };
      };

      const config = getStockConfig(valor || 0);

      return (
        <div className="py-2">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border backdrop-blur-md ${config.bg} ${config.color} ${config.border} ${config.glow} transition-all duration-300`}
          >
            <span className="text-[12px] font-black tracking-tight">
              {valor || 0}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">
              {fila.unidadMedida}
            </span>
          </div>

          {fila.cantidadPorPaquete > 0 && (
            <div className="mt-2 pl-1 border-l-2 border-[var(--border-subtle)] space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-bold italic opacity-80">
                <div className="w-1 h-1 rounded-full bg-amber-500/40" />
                Packs:{" "}
                <span className="text-white">
                  <span className="text-amber-500">
                    {fila.cantidadDePaquetesActuales}
                  </span>{" "}
                  de{" "}
                  <span className="text-amber-500">
                    {fila.cantidadPorPaquete}
                  </span>{" "}
                  und.
                </span>
              </div>
              {fila.cantidadSobrante > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-500/70 font-bold italic">
                  <div className="w-1 h-1 rounded-full bg-amber-500/60 animate-pulse" />
                  <span className="text-[var(--text-muted)] ">Sobrante:</span>{" "}
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
