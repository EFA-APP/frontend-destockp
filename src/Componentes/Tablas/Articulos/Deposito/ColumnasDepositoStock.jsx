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
            renderizar: (v, fila) => {
                const stock = v || 0;
                const esCero = stock === 0;

                return (
                    <div 
                        className="py-1 flex justify-center cursor-pointer group"
                        onClick={() => fila.onActualizarStock && fila.onActualizarStock(fila, dep.codigoSecuencial.toString())}
                        title={`Ajustar stock en ${dep.nombre}`}
                    >
                        <span className={`
                            px-3 py-1.5 rounded-lg border font-black text-[12px] transition-all duration-300
                            group-hover:scale-110 group-active:scale-95
                            ${esCero 
                                ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.05)] group-hover:bg-red-500/20 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)] group-hover:bg-emerald-500/20 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'}
                        `}>
                            {stock.toLocaleString()}
                        </span>
                    </div>
                );
            }
        });
    });

    // Columna de Acciones General Explicita eliminada para limpiar la vista

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
