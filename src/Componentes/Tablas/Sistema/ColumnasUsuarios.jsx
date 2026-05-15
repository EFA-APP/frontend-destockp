import React from "react";
import { Highlight } from "../../UI/DataTable/DataTable";

export const columnasUsuarios = (busqueda) => [
  {
    key: "nombre",
    etiqueta: "Usuario",
    renderizar: (valor, fila) => (
      <div className="flex items-center gap-3 py-1">
        <div className="w-8 h-8 rounded-md bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 shadow-sm">
          <span className="text-[12px] font-black text-[var(--primary)]">
            {valor?.charAt(0)}{fila.apellido?.charAt(0)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-black text-[13px] uppercase tracking-tight text-black leading-tight">
            <Highlight text={`${valor} ${fila.apellido}`} term={busqueda} />
          </span>
          <span className="text-[10px] font-bold text-[var(--text-muted)] lowercase">
            {fila.correoElectronico}
          </span>
        </div>
      </div>
    ),
  },
  {
    key: "codigoSecuencial",
    etiqueta: "ID",
    renderizar: (valor) => (
      <span className="text-[11px] font-black text-[var(--text-muted)]">
        #{String(valor).padStart(3, "0")}
      </span>
    ),
  },
  {
    key: "roles",
    etiqueta: "Roles",
    renderizar: (valor) => (
      <div className="flex flex-wrap gap-1 max-w-[150px]">
        {valor?.length > 0 ? (
          valor.map((rol, i) => (
            <span key={i} title={rol.descripcion} className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-md text-[9px] font-black uppercase tracking-widest text-violet-700">
              {rol.nombre}
            </span>
          ))
        ) : (
          <span className="text-[9px] font-bold text-[var(--text-muted)]/40 italic">SIN ROL</span>
        )}
      </div>
    ),
  },
  {
    key: "permisos",
    etiqueta: "Secciones Habilitadas",
    renderizar: (valor) => (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {valor?.length > 0 ? (
          valor.map((permiso, i) => (
            <span key={i} title={permiso.descripcion} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-[9px] font-black uppercase tracking-widest text-blue-700">
              {permiso.nombre}
            </span>
          ))
        ) : (
          <span className="text-[9px] font-bold text-[var(--text-muted)]/40 italic">SIN ACCESO</span>
        )}
      </div>
    ),
  },
  {
    key: "unidadesNegocio",
    etiqueta: "Unidades",
    renderizar: (valor) => (
      <div className="flex flex-wrap gap-1 max-w-[150px]">
        {valor?.length > 0 ? (
          valor.map((un, i) => (
            <span key={i} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-[9px] font-black uppercase tracking-widest text-amber-700">
              {un.nombre}
            </span>
          ))
        ) : (
          <span className="text-[9px] font-bold text-[var(--text-muted)]/40 italic whitespace-nowrap">GLOBAL / CORPORATIVO</span>
        )}
      </div>
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
