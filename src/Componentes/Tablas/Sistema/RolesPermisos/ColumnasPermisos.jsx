import React from "react";
import { Highlight } from "../../../UI/DataTable/DataTable";

export const columnasPermisos = (busqueda) => [
  {
    key: "nombre",
    etiqueta: "Permiso",
    renderizar: (valor, fila) => (
      <div className="flex items-center gap-3 py-1">
        <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-black text-[13px] uppercase tracking-tight text-black leading-tight">
            <Highlight text={valor} term={busqueda} />
          </span>
          {fila.descripcion && (
            <span
              className="text-[10px] font-bold text-[var(--text-muted)] mt-0.5 max-w-[200px] truncate"
              title={fila.descripcion}
            >
              {fila.descripcion}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "acciones",
    etiqueta: "Acciones Granulares",
    renderizar: (valor) => {
      // El valor puede ser un array JSON con las acciones (CREAR_X, ELIMINAR_X)
      const accionesArray = Array.isArray(valor) ? valor : [];
      return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {accionesArray.length > 0 ? (
            accionesArray.map((acc, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-black/5 border border-black/10 rounded-md text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]"
              >
                {acc.nombre || acc}
              </span>
            ))
          ) : (
            <span className="text-[9px] font-bold text-[var(--text-muted)]/40 italic">
              SOLO LECTURA
            </span>
          )}
        </div>
      );
    },
  },
  {
    key: "activo",
    etiqueta: "Estado",
    renderizar: (valor) => (
      <span
        className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
          valor
            ? "bg-emerald-700/10 text-emerald-400 border-emerald-700/20"
            : "bg-red-700/10 text-red-400 border-red-700/20"
        }`}
      >
        {valor ? "ACTIVO" : "INACTIVO"}
      </span>
    ),
  },
];
