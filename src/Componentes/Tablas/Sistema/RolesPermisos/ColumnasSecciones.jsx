import React from "react";
import { Highlight } from "../../../UI/DataTable/DataTable";

export const columnasSecciones = (busqueda) => [
  {
    key: "nombre",
    etiqueta: "Módulo / Sección",
    renderizar: (valor, fila) => (
      <div className="flex items-center gap-3 py-1">
        <div className="w-8 h-8 rounded-md bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-sm">
          {/* Si tiene un ícono registrado lo mostramos, si no uno genérico */}
          <span className="text-[12px] font-black text-orange-600">
            {fila.icono ? fila.icono.substring(0,2).toUpperCase() : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-black text-[13px] uppercase tracking-tight text-black leading-tight">
            <Highlight text={valor} term={busqueda} />
          </span>
          <span className="text-[10px] font-bold text-[var(--text-muted)] mt-0.5 max-w-[200px] truncate">
            ID: {fila.id_seccion}
          </span>
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
  }
];
