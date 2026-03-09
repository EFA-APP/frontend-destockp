export const columnasProductos = [
  {
    key: "codigoSecuencial",
    etiqueta: "Cód.",
    filtrable: true,
    renderizar: (valor) => (
      <div className="font-mono text-[11px] font-bold text-[var(--primary)] bg-[var(--primary-subtle)]/30 px-2 py-0.5 rounded border border-[var(--primary)]/10 inline-block">
        #{valor}
      </div>
    ),
  },
  {
    key: "nombre",
    etiqueta: "Producto",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div className="py-1">
        <div className="font-bold text-[13px] text-[var(--text-primary)] leading-tight uppercase">{valor}</div>
        <div className="text-[10px] font-medium text-[var(--text-muted)] mt-0.5">
          Unidad: {fila.unidadMedida || "UND"}
        </div>
      </div>
    ),
  },
  {
    key: "stock",
    etiqueta: "Stock Actual",
    filtrable: false,
    renderizar: (valor, fila) => {
      const getStockStyles = (val) => {
        if (val > 50) return "bg-green-500/10 text-green-500 border-green-500/20";
        if (val > 20) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        return "bg-red-500/10 text-red-500 border-red-500/20";
      };

      return (
        <div className="py-1">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStockStyles(valor || 0)}`}>
            {valor || 0} {fila.unidadMedida}
          </span>
          {fila.cantidadPorPaquete > 0 && (
            <div className="flex flex-col gap-0.5 mt-1.5 font-medium italic">
              <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                <span className="w-1 h-1 bg-[var(--primary)]/30 rounded-full" />
                Packs: <span className="text-[var(--primary)]/80 ml-0.5">{fila.cantidadDePaquetesActuales} x {fila.cantidadPorPaquete} und.</span>
              </div>
              {fila.cantidadSobrante > 0 && (
                <div className="text-[10px] text-amber-500/80 flex items-center gap-1">
                  <span className="w-1 h-1 bg-amber-500/30 rounded-full" />
                  Sobrante: <span className="ml-0.5">{fila.cantidadSobrante} und.</span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
  },
];
