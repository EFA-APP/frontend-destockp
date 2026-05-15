const Highlight = ({ text, term }) => {
  if (!term || !text) return text;
  const parts = String(text).split(new RegExp(`(${term})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-400/40 text-[var(--primary)] px-0.5 rounded font-black italic"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
};

export const generarColumnasStock = (depositos = [], busqueda = "") => {
  const columnas = [
    {
      key: "nombre",
      etiqueta: "Producto",
      filtrable: true,
      renderizar: (valor, fila) => (
        <div className="flex items-center gap-2.5 group">
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-[var(--text-primary)] leading-tight mb-0.5 group-hover:text-[var(--primary)]  uppercase tracking-tight">
              <Highlight text={valor} term={busqueda} />
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-theme)]/80 bg-[var(--surface-active)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                <Highlight text={fila.descripcion} term={busqueda} />
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Columnas dinámicas por cada depósito
  depositos.forEach((dep) => {
    columnas.push({
      key: `dep_${dep.codigoSecuencial}`,
      etiqueta: dep.nombre,
      renderizar: (_, fila) => {
        // Buscar el stock para este depósito en el array stockPorDeposito
        const stockItem = (fila.stockPorDeposito || []).find(
          (sp) =>
            sp.codigoDeposito === dep.codigoSecuencial ||
            sp.deposito?.codigoSecuencial === dep.codigoSecuencial,
        );
        const stock = stockItem ? Number(stockItem.stock || 0) : 0;
        const esCero = stock <= 0;

        return (
          <div
            className="py-1 flex justify-center cursor-pointer group"
            onClick={() =>
              fila.onActualizarStock &&
              fila.onActualizarStock(fila, dep.codigoSecuencial.toString())
            }
            title={`Ajustar stock en ${dep.nombre}`}
          >
            <span
              className={`
                            px-3 py-1.5 rounded-md border font-black text-[14px]  
                             group-active:scale-95
                            ${
                              esCero
                                ? "bg-red-700/10 text-red-700 border-red-700/20 shadow-[0_0_10px_rgba(239,68,68,0.05)] group-hover:bg-red-700/20 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                : "bg-emerald-700/10 text-emerald-700 border-emerald-700/20 shadow-[0_0_10px_rgba(16,185,129,0.05)] group-hover:bg-emerald-700/20 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            }
                        `}
            >
              {stock.toLocaleString()}
            </span>
          </div>
        );
      },
    });
  });

  return columnas;
};
