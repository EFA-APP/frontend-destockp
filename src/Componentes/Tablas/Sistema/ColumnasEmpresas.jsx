import React from "react";
import { Highlight } from "../../UI/DataTable/DataTable";

export const columnasEmpresas = (busqueda) => [
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
    key: "nombre",
    etiqueta: "Empresa",
    renderizar: (valor, fila) => (
      <div className="flex flex-col py-1">
        <span className="font-black text-[14px] uppercase tracking-tight text-black">
          <Highlight text={valor} term={busqueda} />
        </span>
        {fila.razonSocial && (
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
            {fila.razonSocial}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "cuit",
    etiqueta: "CUIT",
    renderizar: (valor) => (
      <span className="text-[13px] font-bold tracking-tighter text-black">
        {valor || "---"}
      </span>
    ),
  },
  {
    key: "conexionArca",
    etiqueta: "Estado AFIP",
    renderizar: (valor, fila) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${valor ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 opacity-30"}`}
          />
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${valor ? "text-emerald-600" : "text-red-500 opacity-50"}`}
          >
            {valor ? "CONECTADO" : "DESCONECTADO"}
          </span>
        </div>
        {valor && (
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border w-fit ${fila.esProduccion ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"}`}
          >
            {fila.esProduccion ? "PRODUCCIÓN" : "TESTING"}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "usaContabilidad",
    etiqueta: "Contabilidad",
    renderizar: (valor) => (
      <div className="flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${valor ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-black/10"}`}
        />
        <span
          className={`text-[10px] font-black uppercase tracking-widest ${valor ? "text-blue-600" : "text-[var(--text-muted)] opacity-50"}`}
        >
          {valor ? "ACTIVO" : "NO USA"}
        </span>
      </div>
    ),
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
