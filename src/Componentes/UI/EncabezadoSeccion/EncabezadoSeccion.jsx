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
  subTitulo,
}) => {
  return (
    <div className="relative overflow-hidden p-3 md:mb-5 md:p-4  border-b border-[var(--text-theme)]/20  flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          </div>
          <span className="text-[11px] md:text-[12px] uppercase tracking-[0.2em] font-bold text-[var(--text-muted)] mt-1.5 md:mt-2">
            {subTitulo || "Panel de Gestión"}
          </span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-3">
        {children}

        <nav className="flex items-center gap-2">
          <Link
            to={volver ? redireccionAnterior : "/panel"}
            className="flex items-center justify-center w-10 h-10 rounded-md bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary-subtle)] transition-all shadow-sm group"
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
        </nav>
      </div>
    </div>
  );
};

export default EncabezadoSeccion;
