import React from "react";
import { Highlight } from "../../UI/DataTable/DataTable";

export const columnasRoles = (busqueda) => [
  {
    key: "nombre",
    etiqueta: "Rol",
    renderizar: (valor, fila) => (
      <div className="flex items-center gap-3 py-1">
        <div className="w-8 h-8 rounded-md bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 shadow-sm">
          <span className="text-[12px] font-black text-[var(--primary)]">
            {valor?.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-black text-[13px] uppercase tracking-tight text-black leading-tight">
            <Highlight text={valor} term={busqueda} />
          </span>
          {fila.descripcion && (
            <span className="text-[10px] font-bold text-[var(--text-muted)] mt-0.5 max-w-[200px] truncate" title={fila.descripcion}>
              {fila.descripcion}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "codigo",
    etiqueta: "ID",
    renderizar: (valor) => (
      <span className="text-[11px] font-black text-[var(--text-muted)]">
        #{String(valor).padStart(3, "0")}
      </span>
    ),
  },
  {
    key: "activo",
    etiqueta: "Estado",
    renderizar: (valor) => (
      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
        valor 
          ? "bg-emerald-700/10 text-emerald-400 border-emerald-700/20" 
          : "bg-red-700/10 text-red-400 border-red-700/20"
      }`}>
        {valor ? "ACTIVO" : "INACTIVO"}
      </span>
    ),
  },
  {
    key: "creadoEn",
    etiqueta: "Creación",
    renderizar: (valor) => (
      <span className="text-[11px] font-bold text-[var(--text-muted)]">
        {new Date(valor).toLocaleDateString()}
      </span>
    ),
  }
];
