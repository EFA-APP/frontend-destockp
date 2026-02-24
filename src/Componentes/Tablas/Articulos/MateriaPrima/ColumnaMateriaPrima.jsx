export const columnasMateriaPrima = [
  {
    key: "codigo",
    etiqueta: "Código",
    filtrable: true,
    renderizar: (valor) => (
      <div className="font-mono text-[11px] font-bold text-[var(--primary)] bg-[var(--primary-subtle)]/30 px-2 py-0.5 rounded border border-[var(--primary)]/10 inline-block">
        {valor}
      </div>
    ),
  },
  {
    key: "nombre",
    etiqueta: "Materia Prima",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div className="py-1">
        <div className="font-bold text-[13px] text-[var(--text-primary)] leading-tight">{valor}</div>
        <div className="text-[10px] font-medium text-[var(--text-muted)] mt-0.5">
          {fila.descripcion}
        </div>
      </div>
    ),
  },
  {
    key: "stock",
    etiqueta: "Stock Disp.",
    filtrable: false,
    renderizar: (valor, fila) => {
      const getStockStyles = (val, unit) => {
        const threshold = unit === "kg" ? 20 : 100;
        if (val > threshold * 2) return "bg-green-500/10 text-green-500 border-green-500/20";
        if (val > threshold) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        return "bg-red-500/10 text-red-500 border-red-500/20";
      };

      return (
        <div className="py-1">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStockStyles(valor, fila.unidad)}`}>
            {valor} {fila.unidad}
          </span>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 font-medium italic">
            Pack: {fila.paquetes} × {fila.cantidadPorPaquete} {fila.unidad}
          </div>
        </div>
      );
    },
  },
  {
    key: "precioUnitario",
    etiqueta: "Costo Unit.",
    filtrable: false,
    renderizar: (valor, fila) => (
      <div className="text-[11px] font-semibold text-[var(--text-primary)]">
        <span className="text-[9px] text-[var(--text-muted)] mr-0.5">$</span>
        {valor.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        <span className="text-[9px] text-[var(--text-muted)] ml-0.5">/ {fila.unidad}</span>
      </div>
    ),
  },
  {
    key: "precioTotal",
    etiqueta: "Valorización",
    filtrable: false,
    renderizar: (valor) => (
      <div className="text-[12px] font-bold text-green-500">
        <span className="text-[10px] opacity-70 mr-0.5">$</span>
        {valor.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
      </div>
    ),
  },
];
