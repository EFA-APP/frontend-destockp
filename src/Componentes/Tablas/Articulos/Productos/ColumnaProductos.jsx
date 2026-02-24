export const columnasProductos = [
  {
    key: "nombre",
    etiqueta: "Producto",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div className="py-1">
        <div className="font-bold text-[13px] text-[var(--text-primary)] leading-tight">{valor}</div>
        <div className="text-[10px] font-medium text-[var(--primary)] uppercase tracking-wider mt-0.5">
          {fila.sabor} • {fila.pesoUnitario * 1000}g
        </div>
      </div>
    ),
  },
  {
    key: "stock",
    etiqueta: "Stock",
    filtrable: false,
    renderizar: (valor, fila) => {
      const getStockStyles = (val) => {
        if (val > 50) return "bg-green-500/10 text-green-500 border-green-500/20";
        if (val > 20) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        return "bg-red-500/10 text-red-500 border-red-500/20";
      };

      return (
        <div className="py-1">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStockStyles(valor)}`}>
              {valor} {fila.unidad}
            </span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 font-medium italic">
            {fila.paquetes} pqts × {fila.cantidadPorPaquete} un.
          </div>
        </div>
      );
    },
  },
  {
    key: "pesoTotal",
    etiqueta: "Peso Acum.",
    filtrable: false,
    renderizar: (valor) => (
      <div className="font-mono text-[11px] font-bold text-[var(--text-secondary)]">
        {valor.toFixed(1)} <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-tighter ml-0.5">kg</span>
      </div>
    ),
  },
  {
    key: "precioUnitario",
    etiqueta: "P. Unit.",
    filtrable: false,
    renderizar: (valor) => (
      <div className="text-[11px] font-semibold text-[var(--text-primary)]">
        <span className="text-[9px] text-[var(--text-muted)] mr-0.5">$</span>
        {valor.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
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
        {valor.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    ),
  },
];
