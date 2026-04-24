import { memo } from "react";
import { MapPin, Settings2, Trash2, Building2 } from "lucide-react";
import {
  BorrarIcono,
  PersonaIcono,
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
        bg: "bg-emerald-700/10",
        text: "text-emerald-400",
        badgeBg: "bg-emerald-700",
        border: "border-emerald-700/20",
        glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
        label: "Nodo Central",
      }
    : {
        bg: "bg-amber-700/10",
        text: "text-amber-400",
        badgeBg: "bg-amber-700",
        border: "border-amber-700/20",
        glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
        label: "Sucursal Activa",
      };

  return (
    <div className="relative bg-[var(--surface-active)] border border-[var(--primary-light)]/10 border-sombra rounded-md p-4   flex flex-col h-full active:scale-[0.98] cursor-default w-auto shadow-md hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-500">
      {/* Mobile Layout (Horizontal) / Desktop Layout (Vertical) */}
      <div className="flex flex-row md:flex-col gap-4 flex-grow relative z-10">
        {/* Icon Section */}
        <div className="relative flex flex-col items-center justify-start gap-2">
          <div className="absolute top-0 right-0">
            <button
              onClick={() => onDelete(suc)}
              className=" text-red-700 hover:bg-red-700/10 font-bold text-[13px] uppercase tracking-widest  border border-red-600 cursor-pointer active:scale-[0.98] p-1.5 rounded-md "
              title="Eliminar Depósito"
            >
              <BorrarIcono size={20} className="opacity-60" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between md:justify-start">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-black text-[var(--primary)] uppercase tracking-[0.2em] opacity-40">
                {config.label}
              </span>
            </div>
            <h3 className="text-[18px] md:text-[20px] font-black text-black leading-tight mb-3   line-clamp-1 uppercase tracking-tight">
              {suc.nombre}
            </h3>
          </div>

          {/* Meta info chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="inline-flex items-center gap-2 text-black/40 text-[13px] font-bold bg-black/5 px-2 py-1 rounded border border-black/5">
              <PersonaIcono
                size={10}
                className="text-[var(--primary)] opacity-60"
              />
              <span className="truncate max-w-[80px]">
                {suc.responsable || "S/D"}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 text-black/40 text-[13px] font-bold bg-black/5 px-2 py-1 rounded border border-black/5">
              <MapPin size={10} className="text-[var(--primary)] opacity-60" />
              <span className="truncate max-w-[80px]">
                {suc.ciudad || "S/D"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Address & Contact - Desktop mainly, simplified for mobile */}
      <div className="border-t border-black/5 pt-4 mt-4 space-y-2 relative z-10">
        <div className="flex items-start gap-3 text-[14px]  font-medium text-black/60 ">
          <VentasIcono
            size={14}
            color="var(--primary)"
            className="opacity-40"
          />
          <p className="line-clamp-1 truncate">
            {suc.direccion || "Sin dirección física registrada"}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[14px]  font-medium text-black/60 ">
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
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/5 border border-black/5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${config.badgeBg}  shadow-sm`}
          />
          <span className="text-[11px] font-black uppercase text-black tracking-widest leading-none pt-0.5">
            {suc.principal ? "Principal" : "Sucursal"}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={() => onEdit(suc)}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 text-[var(--primary)]/60 hover:text-[var(--primary)] border border-black/10 hover:border-[var(--primary)]/20 rounded-md font-bold text-[13px] uppercase tracking-widest  cursor-pointer active:scale-95"
          >
            <Settings2 size={13} className="opacity-40" />
            Configurar
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(TarjetaDeposito);
