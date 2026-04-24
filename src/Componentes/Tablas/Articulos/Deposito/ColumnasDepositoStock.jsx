export const generarColumnasStock = (depositos = []) => {
  const columnas = [
    {
      key: "nombre",
      etiqueta: "Producto",
      filtrable: true,
      renderizar: (valor, fila) => (
        <div className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[var(--surface-hover)] flex items-center justify-center text-[var(--primary)] font-black border border-[var(--border-subtle)] text-[14px] group-hover:border-[var(--primary)]/30  ">
            {valor?.[0] || "P"}
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-[var(--text-primary)] leading-tight mb-0.5 group-hover:text-[var(--primary)]  uppercase tracking-tight">
              {valor}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] bg-[var(--surface-active)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                {fila.descripcion}
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
      renderizar: (v, fila) => {
        const stock = v || 0;
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
                            px-3 py-1.5 rounded-lg border font-black text-[14px]  
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
