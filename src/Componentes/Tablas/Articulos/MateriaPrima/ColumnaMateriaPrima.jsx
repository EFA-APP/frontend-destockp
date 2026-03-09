export const columnasMateriaPrima = [
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
    etiqueta: "Materia Prima",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div className="py-1">
        <div className="font-bold text-[13px] text-[var(--text-primary)] leading-tight uppercase">{valor}</div>
        <div className="text-[10px] font-medium text-[var(--text-muted)] mt-0.5">
          Tipo: {fila.tipo || "N/A"}
        </div>
      </div>
    ),
  },
  {
    key: "stock",
    etiqueta: "Stock Actual",
    filtrable: false,
    renderizar: (valor, fila) => {
      const getStockStyles = (val, unit) => {
        const threshold = unit?.toLowerCase() === "kg" ? 20 : 100;
        if (val > threshold * 2) return "bg-green-500/10 text-green-500 border-green-500/20";
        if (val > threshold) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        return "bg-red-500/10 text-red-500 border-red-500/20";
      };

      return (
        <div className="py-1">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStockStyles(valor, fila.unidadMedida)}`}>
            {valor || 0} {fila.unidadMedida}
          </span>
          {fila.cantidadPorPaquete && (
            <div className="text-[10px] text-[var(--text-muted)] mt-1 font-medium italic">
              Pack: 
              <span className="text-[var(--primary)]/70 ml-1">{fila.cantidadPorPaquete} {fila.unidadMedida}</span>
            </div>
          )}
        </div>
      );
    },
  },
];
