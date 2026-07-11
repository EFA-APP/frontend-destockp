import React from "react";
import { Highlight } from "../../UI/DataTable/DataTable";

export const columnasUnidadesNegocio = (busqueda = "") => [
  {
    key: "codigo",
    etiqueta: "CÓDIGO",
    renderizar: (valor) => (
      <span className="font-black text-black/40 text-[11px] tracking-widest">
        #{String(valor).padStart(3, '0')}
      </span>
    ),
  },
  {
    key: "nombre",
    etiqueta: "UNIDAD DE NEGOCIO",
    renderizar: (valor, fila) => (
      <div className="flex flex-col">
        <span className="font-black text-black uppercase text-[12px] tracking-tight">
          <Highlight text={valor} term={busqueda} />
        </span>
        {fila.direccion && (
          <span className="text-[10px] font-bold text-black/30 truncate max-w-[200px]">
            {fila.direccion}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "descripcion",
    etiqueta: "DESCRIPCIÓN",
    renderizar: (valor) => (
      <span className="text-[11px] font-medium text-black/60 italic">
        {valor || "Sin descripción"}
      </span>
    ),
  },
  {
    key: "configuracion",
    etiqueta: "CONFIGURACIÓN",
    renderizar: (valor) => {
      if (!valor || Object.keys(valor).length === 0) return (
        <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest italic">Estándar</span>
      );
      return (
        <div className="flex flex-wrap gap-1 max-w-[250px]">
          {Object.keys(valor).map(key => (
            <span key={key} className="px-1.5 py-0.5 bg-black/5 border border-black/10 rounded text-[9px] font-black text-black/60 uppercase tracking-tighter">
              {key}
            </span>
          ))}
        </div>
      );
    }
  },
  {
    key: "activo",
    etiqueta: "ESTADO",
    renderizar: (valor) => (
      <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest inline-block border ${
        valor 
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
          : "bg-rose-500/10 text-rose-600 border-rose-500/20"
      }`}>
        {valor ? "OPERATIVA" : "INACTIVA"}
      </div>
    ),
  },
];
