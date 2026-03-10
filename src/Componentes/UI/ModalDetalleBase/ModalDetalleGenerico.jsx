import { useState, useEffect } from "react";
import Metrica from "./Metricas";
import ModalDetalle from "./ModalDetalle";
import ModalDetalleBase from "./ModalDetalleBase";

const ModalDetalleGenerico = ({
  open,
  onClose,
  title,
  icon,
  data,
  metrics = [],
  sections = [],
  mode = "view",
  onSave,
  width = "max-w-[600px]",
  accentColor = "amber",
  children,
}) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  if (!open || !data) return null;

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isEdit = mode === "editar";

  const themes = {
    amber: {
      button: "bg-amber-600! hover:bg-amber-500! border-amber-400/20! shadow-amber-900/40!",
      bullet: "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]",
      subTitle: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      inputFocus: "focus:border-amber-500/50 focus:ring-amber-500/20",
      cardBg: "bg-gradient-to-br from-amber-500/[0.05] via-transparent to-transparent border-amber-500/10 hover:border-amber-500/30 hover:bg-amber-500/[0.08]",
      accent: "text-amber-500",
      glow: "shadow-[0_0_40px_rgba(245,158,11,0.05)]"
    },
    emerald: {
      button: "bg-emerald-600! hover:bg-emerald-500! border-emerald-400/20! shadow-emerald-900/40!",
      bullet: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]",
      subTitle: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      inputFocus: "focus:border-emerald-500/50 focus:ring-emerald-500/20",
      cardBg: "bg-gradient-to-br from-emerald-500/[0.05] via-transparent to-transparent border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/[0.08]",
      accent: "text-emerald-500",
      glow: "shadow-[0_0_40px_rgba(16,185,129,0.05)]"
    },
    blue: {
      button: "bg-blue-600 hover:bg-blue-500 border-blue-400/20 shadow-blue-900/40",
      bullet: "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]",
      subTitle: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      inputFocus: "focus:border-blue-500/50 focus:ring-blue-500/20",
      cardBg: "bg-gradient-to-br from-blue-500/[0.05] via-transparent to-transparent border-blue-500/10 hover:border-blue-500/30 hover:bg-blue-500/[0.08]",
      accent: "text-blue-500",
      glow: "shadow-[0_0_40px_rgba(59,130,246,0.05)]"
    },
    rose: {
      button: "bg-rose-600 hover:bg-rose-500 border-rose-400/20 shadow-rose-900/40",
      bullet: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]",
      subTitle: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      inputFocus: "focus:border-rose-500/50 focus:ring-rose-500/20",
      cardBg: "bg-gradient-to-br from-rose-500/[0.05] via-transparent to-transparent border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/[0.08]",
      accent: "text-rose-500",
      glow: "shadow-[0_0_40px_rgba(244,63,94,0.05)]"
    },
    indigo: {
      button: "bg-indigo-600 hover:bg-indigo-500 border-indigo-400/20 shadow-indigo-900/40",
      bullet: "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]",
      subTitle: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      inputFocus: "focus:border-indigo-500/50 focus:ring-indigo-500/20",
      cardBg: "bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-transparent border-indigo-500/10 hover:border-indigo-500/30 hover:bg-indigo-500/[0.08]",
      accent: "text-indigo-500",
      glow: "shadow-[0_0_40px_rgba(99,102,241,0.05)]"
    }
  };

  const theme = themes[accentColor] || themes.amber;

  const footer = isEdit ? (
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
      <button
        onClick={onClose}
        className="order-2 sm:order-1 flex-1 px-7 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white/50 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg"
      >
        Cancelar
      </button>
      <button
        onClick={() => onSave?.(formData)}
        className={`order-1 sm:order-2 flex-1 px-8 py-3.5 rounded-2xl ${theme.button} text-white text-[11px] font-black uppercase tracking-[0.25em] transition-all shadow-xl active:scale-95 border`}
      >
        Guardar Cambios
      </button>
    </div>
  ) : null;

  return (
    <ModalDetalleBase open={open} onClose={onClose} width={width}>
      <ModalDetalle
        title={title}
        icon={icon}
        onClose={onClose}
        footer={footer}
        accentColor={accentColor}
      >
        <div className={`space-y-8 animate-in fade-in duration-700 ${theme.glow}`}>
          
          {/* SECCIONES - Grid Layout for View Mode */}
          <div className={isEdit ? "space-y-6" : "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6"}>
            {sections.map((section, idx) => {
              const editable = section.editable;
              const value = formData[section.key];
              const hasValue = value !== undefined && value !== null && value !== "";
              
              if (section.ocultar && !isEdit) return null;

              return (
                <div key={idx} className={`group/item relative overflow-hidden ${!isEdit ? `${theme.cardBg} border rounded-2xl p-5 transition-all duration-500 backdrop-blur-sm` : ""}`}>
                  {!isEdit && <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] blur-3xl rounded-full -mr-12 -mt-12" />}
                  
                  <div className="flex items-center gap-2 mb-3 opacity-40 group-hover/item:opacity-80 transition-opacity">
                    <div className={`w-2 h-2 ${theme.bullet} rounded-full`} />
                    <p className="text-[10px] text-white font-black uppercase tracking-[0.2em] leading-none">
                      {section.label}
                    </p>
                  </div>

                  {isEdit && editable ? (
                    <div className="relative animate-in slide-in-from-left-4 duration-500">
                      {section.type === "select" ? (
                        <div className="relative">
                          <select
                            value={formData[section.key] ?? ""}
                            onChange={(e) => handleChange(section.key, e.target.value)}
                            className={`w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-[14px] text-white font-bold focus:outline-none ${theme.inputFocus} focus:ring-1 transition-all appearance-none cursor-pointer shadow-inner backdrop-blur-md`}
                          >
                            {section.options?.map((opt) => (
                              <option key={opt.value} value={opt.value} className="bg-[#0a0a0a] text-white p-4">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <input
                          type={section.type || "text"}
                          value={formData[section.key] ?? ""}
                          onChange={(e) => handleChange(section.key, e.target.value)}
                          className={`w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-[14px] text-white font-bold placeholder:text-white/10 focus:outline-none ${theme.inputFocus} focus:ring-1 transition-all shadow-inner backdrop-blur-md`}
                          placeholder={`Ingresar ${section.label.toLowerCase()}...`}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="relative z-10 animate-in zoom-in-95 duration-700">
                      <p className={`text-[16px] font-black text-white tracking-tight leading-tight group-hover/item:translate-x-1 transition-transform duration-500 ${!hasValue ? "italic opacity-20" : ""}`}>
                        {hasValue ? value : "No especificado"}
                      </p>
                      
                      {section.sub && hasValue && (
                        <div className={`mt-3 inline-flex items-center px-2.5 py-1 ${theme.subTitle} rounded-xl shadow-sm`}>
                          <p className={`text-[10px] font-black uppercase tracking-widest`}>
                            {section.sub(data)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* KPI METRICS - Refined Branding */}
          {!isEdit && metrics.length > 0 && (
            <div className="pt-8 border-t border-white/[0.05]">
              <div className="flex items-center gap-3 mb-5 opacity-40">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] whitespace-nowrap text-[var(--text-theme)]">Indicadores</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {metrics.map((m, idx) => (
                  <Metrica
                    key={idx}
                    label={m.label}
                    accentColor={accentColor}
                    value={
                      typeof m.value === "function"
                        ? m.value(data)
                        : data[m.value]
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* CHILDREN / SLOT */}
          {children && (
            <div className="pt-8 border-t border-white/[0.05] animate-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          )}
        </div>
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalDetalleGenerico;
