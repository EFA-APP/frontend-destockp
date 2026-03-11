import React from "react";

/**
 * Genera las columnas dinámicas para la matriz de stock por depósito.
 * @param {Array} depositos - Lista de depósitos obtenidos del backend.
 * @returns {Array} Configuración de columnas para DataTable.
 */
export const generarColumnasStock = (depositos = []) => {
    const columnas = [
        {
            key: "nombre",
            etiqueta: "Producto",
            filtrable: true,
            renderizar: (valor, fila) => (
                <div className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl bg-[var(--surface-hover)] flex items-center justify-center text-[var(--primary)] font-black border border-[var(--border-subtle)] text-[12px] group-hover:border-[var(--primary)]/30 transition-all duration-300">
                        {valor?.[0] || 'P'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[var(--text-primary)] leading-tight mb-0.5 group-hover:text-[var(--primary)] transition-colors uppercase tracking-tight">
                            {valor}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] bg-[var(--surface-active)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                                {fila.unidadMedida || "UNIDAD"}
                            </span>
                            <span className="text-[9px] text-[var(--text-muted)] font-mono opacity-60">
                                {fila.sku}
                            </span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    // Columnas dinámicas por cada depósito
    depositos.forEach(dep => {
        columnas.push({
            key: `dep_${dep.codigoSecuencial}`,
            etiqueta: dep.nombre,
            renderizar: (v) => {
                const stock = v || 0;
                const esCero = stock === 0;

                return (
                    <div className="py-1">
                        <span className={`
                            px-2.5 py-1 rounded-lg border font-black text-[11px] transition-all duration-300
                            ${esCero
                                ? 'bg-red-500/20 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.05)]'
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]'}
                        `}>
                            {stock.toLocaleString()}
                        </span>
                    </div>
                );
            }
        });
    });

    // Columna de Total Global
    columnas.push({
        key: "total",
        etiqueta: "Total Global",
        renderizar: (v) => (
            <div className="py-1 text-center">
                <span className="px-3 py-1 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 text-[var(--primary)] font-black rounded-lg border border-[var(--primary)]/20 text-[12px] shadow-sm">
                    {v.toLocaleString()}
                </span>
            </div>
        )
    });

    return columnas;
};
