import { Link } from "react-router-dom";
import { InicioIcono, VolverIcono } from "../../../assets/Icons";
import React from "react";

const EncabezadoSeccion = ({
  ruta,
  icono,
  volver = false,
  redireccionAnterior,
}) => {
  return (
    <div
      className="rounded-md! p-5 py-2 bg-[var(--surface)]
          border border-[var(--border-subtle)]
          shadow-sm mb-6 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md! bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/10">
          {icono}
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight leading-none">{ruta}</h1>
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[var(--text-muted)] mt-1 px-0.5">Módulo activo</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ol className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
          <li >
            <Link
              className="p-2 rounded-md!  text-[var(--text-secondary)]! hover:text-[var(--primary)]! transition-all border border-[var(--border-subtle)]!"
              to={`${volver ? redireccionAnterior : "/panel"}`}
            >
              {volver ? <VolverIcono size={16} /> : <InicioIcono size={16} />}
            </Link>
          </li>
          <li className="text-[var(--text-muted)] opacity-30 px-1">/</li>
          <li>
            <div className="px-2.5 py-1 rounded-md! bg-[var(--primary-subtle)] text-[var(--primary)] text-[9px] font-bold border border-[var(--primary)]/10">
              {ruta}
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default EncabezadoSeccion;
