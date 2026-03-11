import React from "react";
import { MapPin, Settings2, Phone, Home, Package } from "lucide-react";
import { PersonaIcono, CheckIcono, TelefonoIcono, InicioIcono, VentasIcono } from "../../../../assets/Icons";

/**
 * Componente CardDeposito: Representación visual de una sucursal/depósito.
 */
const TarjetaDeposito = ({ suc, onEdit }) => {
    // --- UI HELPERS ---
    const getStatusConfig = (esPrincipal) => {
        if (esPrincipal) {
            return {
                bg: "bg-emerald-500/10",
                text: "text-emerald-400",
                badgeBg: "bg-emerald-500",
                border: "border-emerald-500/20",
                icon: <CheckIcono size={12} />,
                label: "Principal",
                glow: "shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            };
        }
        return {
            bg: "bg-blue-500/10",
            text: "text-blue-400",
            badgeBg: "bg-blue-500",
            border: "border-blue-500/20",
            icon: <Package size={12} />,
            label: "Activo",
            glow: "shadow-[0_0_20px_rgba(59,130,246,0.25)]"
        };
    };

    const config = getStatusConfig(suc.principal);

    return (
        <div className="group relative bg-[var(--surface)] border border-white/5 rounded-[22px] p-4.5 transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] hover:border-[var(--primary)]/40 overflow-hidden flex flex-col h-full active:scale-[0.98]">
            {/* Background Neon Accent */}
            <div className={`absolute -right-12 -top-12 w-40 h-40 ${config.bg} rounded-full blur-[70px] group-hover:scale-150 transition-transform duration-1000 opacity-50`} />

            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`w-11 h-11 rounded-xl bg-black/40 flex items-center justify-center border ${config.border} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${config.glow}`}>
                    <MapPin size={22} className={config.text} strokeWidth={2} />
                </div>

                <div className={`px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 flex items-center gap-1.5 backdrop-blur-md shadow-inner`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${config.badgeBg} animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.4)]`} />
                    <span className={`text-[9px] font-black uppercase tracking-wider text-gray-300`}>
                        {config.label}
                    </span>
                </div>
            </div>

            <div className="relative z-10 mb-4 flex-grow">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-[var(--primary)] uppercase tracking-[0.3em] mb-0.5 opacity-60">
                        Sucursal
                    </span>
                    <h3 className="text-[18px] font-black text-white leading-tight mb-2 group-hover:text-[var(--primary)] transition-colors duration-500 tracking-tight line-clamp-1">
                        {suc.nombre}
                    </h3>
                </div>

                <div className="inline-flex items-center gap-2 text-gray-400 text-[11px] font-bold bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 group-hover:border-[var(--primary)]/20 transition-all duration-500 shadow-sm">
                    <PersonaIcono size={12} className="text-[var(--primary)] opacity-80" />
                    <span className="truncate max-w-[110px]">{suc.responsable || "S/D"}</span>
                </div>
            </div>

            <div className="space-y-3 relative z-10 py-4 border-t border-white/5 mt-auto">
                <div className="flex items-start gap-3.5 text-[10px] text-gray-400 font-semibold leading-relaxed group-hover:text-gray-100 transition-all duration-500">
                    <VentasIcono size={13} color="var(--primary)" />
                    <p className="line-clamp-2">{suc.direccion || "Sin dirección"}</p>
                </div>

                <div className="flex items-center gap-3.5 text-[10px] text-gray-400 font-bold group-hover:text-gray-100 transition-all duration-500">
                    <TelefonoIcono size={13} color={"var(--primary)"} />
                    <span className="tracking-wide">{suc.telefono || "Sin contacto"}</span>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none mb-0.5">Localidad</span>
                    <span className="text-[11px] font-black text-white/90 uppercase tracking-widest leading-none">
                        {suc.ciudad || "S/D"}
                    </span>
                </div>

                <button
                    onClick={() => onEdit(suc)}
                    className="group/edit! relative! flex! items-center! gap-2! px-4! py-2! bg-[var(--primary)]! text-white! rounded-xl! font-black! text-[10px]! uppercase! tracking-widest! transition-all! duration-500! shadow-[0_10px_20px_-10px_rgba(var(--primary-rgb),0.6)]! hover:shadow-[0_15px_30px_-5px_rgba(var(--primary-rgb),0.8)]! hover:-translate-y-1! active:scale-95! overflow-hidden! cursor-pointer!"
                >
                    <div className="absolute! inset-0! bg-gradient-to-tr! from-white/30! to-transparent! opacity-0! group-hover/edit:opacity-100! transition-opacity!" />
                    <Settings2 size={13} className="relative! z-10! group-hover/edit:rotate-180! transition-transform! duration-700! ease-out!" />
                    <span className="relative! z-10!">Configurar</span>
                </button>
            </div>

            {/* Discrete Bottom Accent */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent group-hover:w-full transition-all duration-1000 opacity-40 shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" />
        </div>
    );
};

export default TarjetaDeposito;
