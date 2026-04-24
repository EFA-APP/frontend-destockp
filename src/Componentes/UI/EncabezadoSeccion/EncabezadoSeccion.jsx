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
    <div className="relative overflow-hidden p-3 md:p-4 mb-4 border-b border-[var(--text-theme)]/30  flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4 md:gap-5">
        {/* Contenedor del Icono */}
        <div className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[var(--fill)] text-[var(--primary)] border border-[var(--primary)]/20 shadow-sm">
          {React.isValidElement(icono)
            ? React.cloneElement(icono, { size: 26 })
            : icono}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tight leading-none uppercase">
              {ruta}
            </h1>
            <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-[var(--primary)] text-white text-[9px] font-black uppercase tracking-widest shadow-sm shadow-[var(--primary)]/30">
              Activo
            </span>
          </div>
          <span className="text-[11px] md:text-[12px] uppercase tracking-[0.2em] font-bold text-[var(--text-muted)] mt-1.5 md:mt-2">
            Panel de Gestión
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {children}

        <nav className="hidden sm:flex items-center gap-2">
          <Link
            to={volver ? redireccionAnterior : "/panel"}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary-subtle)] transition-all shadow-sm group"
            title={volver ? "Volver" : "Inicio"}
          >
            {volver ? (
              <VolverIcono
                size={20}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            ) : (
              <InicioIcono
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
            )}
          </Link>

          {otroIcono && (
            <Link
              to={otroIcono.ruta}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary-subtle)] transition-all shadow-sm group"
              title={otroIcono.titulo}
            >
              {React.isValidElement(otroIcono.icono)
                ? React.cloneElement(otroIcono.icono, {
                    size: 20,
                    className: "group-hover:scale-110 transition-transform",
                  })
                : otroIcono.icono}
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
};

export default EncabezadoSeccion;
