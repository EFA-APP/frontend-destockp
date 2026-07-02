import React from "react";

export const columnasLogsArca = () => [
  {
    key: "fechaCreacion",
    etiqueta: "FECHA / HORA",
    renderizar: (valor) => {
      const fecha = new Date(valor);
      return (
        <div className="flex flex-col">
          <span className="font-bold text-[13px] text-black">
            {fecha.toLocaleDateString("es-AR")}
          </span>
          <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest">
            {fecha.toLocaleTimeString("es-AR")}
          </span>
        </div>
      );
    },
  },
  {
    key: "categoria",
    etiqueta: "CATEGORÍA",
    renderizar: (valor) => (
      <span className="text-[11px] font-black uppercase tracking-widest text-black">
        {valor}
      </span>
    ),
  },
  {
    key: "estado",
    etiqueta: "ESTADO",
    renderizar: (valor) => {
      const esExito = valor === "EXITO";
      return (
        <span
          className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
            esExito
              ? "bg-emerald-700/10 text-emerald-600 border-emerald-700/20"
              : "bg-red-700/10 text-red-600 border-red-700/20"
          }`}
        >
          {valor}
        </span>
      );
    },
  },
  {
    key: "duracionMs",
    etiqueta: "DURACIÓN (ms)",
    renderizar: (valor) => (
      <span className="text-[12px] font-bold text-[var(--text-muted)]">
        {valor != null ? `${valor} ms` : "---"}
      </span>
    ),
  },
];
