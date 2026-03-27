import { Link } from "react-router-dom";
import { InicioIcono, VolverIcono } from "../../../assets/Icons";
import React from "react";

const EncabezadoSeccion = ({
  ruta,
  icono,
  otroIcono,
  volver = false,
  redireccionAnterior,
  children,
}) => {
  return (
    <div
      className="relative overflow-hidden rounded-md p-2 md:p-4 md:mb-8
          bg-[var(--surface)]/60 backdrop-blur-xl
          border border-[var(--border-subtle)]
          shadow-xl shadow-[var(--primary)]/5
          flex flex-col md:flex-row md:items-center justify-between gap-4
          animate-in fade-in slide-in-from-top-4 duration-500"
    >
      {/* Efecto de Brillo Interno */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-center gap-4">
        {/* Contenedor del Icono con Degradado */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-active)] rounded-xl blur-sm opacity-20 group-hover:opacity-40 transition duration-500" />
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-active)] text-white shadow-lg shadow-[var(--primary)]/20 border border-white/10">
            {React.isValidElement(icono)
              ? React.cloneElement(icono, { size: 20 })
              : icono}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-md md:text-lg font-black text-[var(--text-primary)] tracking-tight leading-none">
              {ruta}
            </h1>
            <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] text-[8px] font-bold uppercase tracking-widest border border-[var(--primary)]/10">
              Activo
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--text-muted)] mt-1.5 opacity-70">
            Gestión de Sistema
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {children}
        <nav className="hidden sm:flex items-center gap-2 md:gap-3">
          <Link
            to={volver ? redireccionAnterior : "/panel"}
            className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all duration-300 shadow-sm"
            title={volver ? "Volver" : "Inicio"}
          >
            {volver ? <VolverIcono size={20} /> : <InicioIcono size={20} />}
          </Link>

          {otroIcono && (
            <Link
              to={otroIcono.ruta}
              className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all duration-300 shadow-sm"
              title={otroIcono.titulo}
            >
              {otroIcono.icono}
            </Link>
          )}

          <div className="h-6 w-px bg-[var(--border-subtle)] mx-1" />

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-[var(--surface-hover)] p-1 pr-3 rounded-xl border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)]">
              {volver ? (
                <VolverIcono size={14} />
              ) : React.isValidElement(icono) ? (
                React.cloneElement(icono, { size: 20 })
              ) : (
                icono
              )}
            </div>
            <span className="text-[var(--text-muted)] opacity-50">/</span>
            <span className="text-[var(--primary)]">{ruta}</span>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default EncabezadoSeccion;
