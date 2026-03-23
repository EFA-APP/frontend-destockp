import React, { useState } from "react";
import { MapPin, Settings2, Trash2, Building2 } from "lucide-react";
import {
  PersonaIcono,
  CheckIcono,
  TelefonoIcono,
  VentasIcono,
} from "../../../../assets/Icons";

/**
 * Componente TarjetaDeposito: Representación visual premium de una sucursal.
 */
const TarjetaDeposito = ({ suc, onEdit, onDelete }) => {
  const isPrincipal = suc.principal;

  const config = isPrincipal
    ? {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        badgeBg: "bg-emerald-500",
        border: "border-emerald-500/20",
        glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
        label: "Nodo Central",
      }
    : {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        badgeBg: "bg-amber-500",
        border: "border-amber-500/20",
        glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
        label: "Sucursal Activa",
      };

  return (
    <div className="group relative bg-[var(--surface)] border border-white/5 rounded-md p-4 transition-all duration-500 hover:shadow-2xl hover:border-white/10 overflow-hidden flex flex-col h-full active:scale-[0.98] cursor-default">
      {/* Mobile Layout (Horizontal) / Desktop Layout (Vertical) */}
      <div className="flex flex-row md:flex-col gap-4 flex-grow relative z-10">
        {/* Icon Section */}
        <div className="flex flex-col items-center justify-start gap-2">
          <div
            className={`w-14 h-14 md:w-16 md:h-16 rounded-md bg-black/40 flex items-center justify-center border ${config.border} transition-all duration-500 group-hover:scale-105 ${config.glow}`}
          >
            <Building2 size={24} className={config.text} strokeWidth={1.5} />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between md:justify-start">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em] opacity-40">
                {config.label}
              </span>
            </div>
            <h3 className="text-[16px] md:text-[18px] font-black text-white leading-tight mb-3 group-hover:text-[var(--primary)] transition-colors line-clamp-1 uppercase tracking-tight">
              {suc.nombre}
            </h3>
          </div>

          {/* Meta info chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="inline-flex items-center gap-2 text-white/40 text-[11px] font-bold bg-white/5 px-2 py-1 rounded border border-white/5">
              <PersonaIcono
                size={10}
                className="text-[var(--primary)] opacity-60"
              />
              <span className="truncate max-w-[80px]">
                {suc.responsable || "S/D"}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 text-white/40 text-[11px] font-bold bg-white/5 px-2 py-1 rounded border border-white/5">
              <MapPin size={10} className="text-[var(--primary)] opacity-60" />
              <span className="truncate max-w-[80px]">
                {suc.ciudad || "S/D"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Address & Contact - Desktop mainly, simplified for mobile */}
      <div className="border-t border-white/5 pt-4 mt-4 space-y-2 relative z-10">
        <div className="flex items-start gap-3 text-[12px] group-hover:text-[var(--primary-light)] font-medium text-white/60 transition-colors">
          <VentasIcono
            size={14}
            color="var(--primary)"
            className="opacity-40"
          />
          <p className="line-clamp-1 truncate">
            {suc.direccion || "Sin dirección física registrada"}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[12px] group-hover:text-[var(--primary-light)] font-medium text-white/60 transition-colors">
          <TelefonoIcono
            size={14}
            color="var(--primary)"
            className="opacity-40"
          />
          <span>{suc.telefono || "Sin contacto"}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${config.badgeBg} animate-pulse shadow-sm`}
          />
          <span className="text-[9px] font-black uppercase text-white tracking-widest leading-none pt-0.5">
            {suc.principal ? "Principal" : "Sucursal"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(suc)}
            className="flex items-center gap-2.5 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-md font-bold text-[11px] uppercase tracking-widest transition-all cursor-pointer active:scale-[0.98] group/delete"
            title="Eliminar Depósito"
          >
            <Trash2
              size={13}
              className="opacity-60 group-hover/delete:opacity-100 transition-all duration-300"
            />
          </button>

          <button
            onClick={() => onEdit(suc)}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-white/5 hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-md font-bold text-[11px] uppercase tracking-widest transition-all cursor-pointer active:scale-95 group/edit"
          >
            <Settings2
              size={13}
              className="opacity-40 group-hover/edit:opacity-100 group-hover/edit:rotate-90 transition-all duration-500"
            />
            Configurar
          </button>
        </div>
      </div>

      {/* Subtle glow effect */}
      <div
        className={`absolute -bottom-10 -right-10 w-24 h-24 ${config.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
      />
    </div>
  );
};

export default TarjetaDeposito;
