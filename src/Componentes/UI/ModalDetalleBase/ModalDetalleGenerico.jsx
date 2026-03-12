import React, { useState, useEffect } from "react";
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
  width = "max-w-[700px]",
  accentColor = "amber",
  children,
  tabs = [
    { id: "info", label: "Información" },
    { id: "stock", label: "Estadísticas" },
    { id: "historial", label: "Bitácora" }
  ],
  initialTab = "info",
  isStandalone = false,
  hideTabs = false
}) => {
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  useEffect(() => {
    if (open || isStandalone) setActiveTab(initialTab);
  }, [open, isStandalone, initialTab]);

  if ((!open && !isStandalone) || !data) return null;

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isEdit = mode === "editar";

  const themes = {
    amber: {
      accent: "text-amber-500!",
      bg: "bg-amber-500/10!",
      border: "border-amber-500/20!",
      button: "bg-amber-600! hover:bg-amber-500! border-amber-400/20!",
      input: "focus:border-amber-500/50! focus:ring-amber-500/20!",
      tabActive: "text-amber-500! bg-amber-500/10! border-amber-500/20!"
    },
    emerald: {
      accent: "text-emerald-500!",
      bg: "bg-emerald-500/10!",
      border: "border-emerald-500/20!",
      button: "bg-emerald-600! hover:bg-emerald-500! border-emerald-400/20!",
      input: "focus:border-emerald-500/50! focus:ring-emerald-500/20!",
      tabActive: "text-emerald-500! bg-emerald-500/10! border-emerald-500/20!"
    },
    blue: {
      accent: "text-blue-500!",
      bg: "bg-blue-500/10!",
      border: "border-blue-500/20!",
      button: "bg-blue-600! hover:bg-blue-500! border-blue-400/20!",
      input: "focus:border-blue-500/50! focus:ring-blue-500/20!",
      tabActive: "text-blue-500! bg-blue-500/10! border-blue-500/20!"
    }
  };

  const theme = themes[accentColor] || themes.amber;

  const filteredSections = (isEdit || hideTabs)
    ? sections
    : sections.filter(s => (s.tab || "info") === activeTab);

  const footer = isEdit ? (
    <div className="flex gap-3 w-full animate-in! fade-in! slide-in-from-bottom-2! duration-500! ">
      <button
        onClick={onClose}
        className="flex-1 px-6 py-3 rounded-md! bg-white/[0.03]! border! border-white/10! hover:bg-white/[0.08]! text-white/40! hover:text-white! text-[10px] font-black uppercase tracking-[0.15em] transition-all!"
      >
        Cancelar
      </button>
      <button
        onClick={() => onSave?.(formData)}
        className={`flex-1 px-6 py-3 rounded-md! ${theme.button} text-white! text-[10px] font-black uppercase tracking-[0.15em] transition-all! shadow-xl! active:scale-95!`}
      >
        Guardar Cambios
      </button>
    </div>
  ) : null;

  const content = (
    <ModalDetalle
      title={title}
      icon={icon}
      onClose={onClose}
      footer={footer}
      accentColor={accentColor}
      isStandalone={isStandalone}
    >
      <div className="relative space-y-6 pb-2">

        {/* COMPACT CLEAN HEADER */}
        {!isEdit && (
          <div className="flex items-center gap-4 p-4 rounded-md! bg-gradient-to-br from-white/[0.02] to-transparent! border! border-white/5! shadow-lg!">
            <div className={`p-2.5 rounded-md! ${theme.bg} border! ${theme.border} shadow-inner!`}>
              {icon && React.isValidElement(icon) ? React.cloneElement(icon, { size: 20, color: "white" }) : null}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5 opacity-30">
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse!" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white!">Detalles</span>
              </div>
              <h2 className="text-lg font-black text-white! tracking-tight uppercase leading-none mb-1">
                {data.nombre || title}
              </h2>
              <div className="flex items-center gap-2.5">
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.05em]">
                  Código: <span className="text-white/50! font-mono">{data.codigoSecuencial || "N/A"}</span>
                </p>
                <div className="w-1 h-1 rounded-full bg-white/10" />
                <span className={`text-[9px] font-black uppercase tracking-widest ${theme.accent}`}>Activo</span>
              </div>
            </div>
          </div>
        )}

        {/* COMPACT TAB NAVIGATION */}
        {!isEdit && !hideTabs && (
          <div className="flex items-center gap-1.5 p-1 bg-black/40! border! border-white/10! rounded-md! shadow-inner!">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-4 rounded-md! text-[9px] font-black uppercase tracking-[0.15em] transition-all! duration-300! relative overflow-hidden! ${activeTab === tab.id
                  ? theme.tabActive
                  : "text-white/20! hover:text-white/50!"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* METRICS GRID - Compact Style (Hidden in Edit mode) */}
        {!isEdit && ((activeTab === "stock") || hideTabs) && metrics.length > 0 && (
          <div className="grid grid-cols-3 gap-3 animate-in! fade-in! slide-in-from-top-3! duration-500!">
            {metrics.map((m, idx) => (
              <Metrica
                key={idx}
                label={m.label}
                accentColor={accentColor}
                value={typeof m.value === "function" ? m.value(data) : data[m.value]}
              />
            ))}
          </div>
        )}

        {/* DATA CONTAINER - Clean Form Style */}
        {(activeTab === "info" || isEdit || hideTabs) && (
          <div className={`p-6! rounded-md! border! border-white/5! bg-white/[0.01]! shadow-inner! ${isEdit ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 space-y-0"}`}>
            {filteredSections.map((section, idx) => {
              const editable = section.editable;
              const value = formData[section.key];
              const hasValue = value !== undefined && value !== null && value !== "";

              if (section.ocultar && !isEdit) return null;

              return (
                <div key={idx} className={`group/field flex flex-col ${isEdit && section.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                  <div className="flex items-center gap-2 mb-1.5 opacity-40 group-hover/field:opacity-100 transition-opacity!">
                    <div className={`w-0.5 h-2.5 ${theme.bg} rounded-full transition-all! group-hover/field:h-3.5`} />
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white!">
                      {section.label}
                    </p>
                  </div>

                  {isEdit && editable ? (
                    <div className="relative group/input">
                      {section.type === "select" ? (
                        <select
                          value={formData[section.key] ?? ""}
                          onChange={(e) => handleChange(section.key, e.target.value)}
                          className={`w-full bg-black/60! border! border-white/10! rounded-md! px-3.5 py-2.5 text-[12px] text-white! font-bold transition-all! ${theme.input} focus:outline-none! focus:bg-black!`}
                        >
                          {section.options?.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[#0e0e0e] text-white p-4">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : section.type === "textarea" ? (
                        <textarea
                          rows={2}
                          value={formData[section.key] ?? ""}
                          onChange={(e) => handleChange(section.key, e.target.value)}
                          className={`w-full bg-black/60! border! border-white/10! rounded-md! px-3.5 py-2.5 text-[12px] text-white! font-bold transition-all! ${theme.input} focus:outline-none! focus:bg-black! resize-none!`}
                          placeholder={`ENTER_${section.label.toUpperCase()}...`}
                        />
                      ) : section.type === "boolean" ? (
                        <label className={`flex items-center justify-between gap-3 px-3.5 py-2.5 bg-black/40! border! border-white/10! rounded-md! cursor-pointer transition-all! ${theme.input} hover:bg-black/60!`}>
                          <span className="text-[11px] text-white/50! font-bold uppercase tracking-widest">
                            Estado: <span className={formData[section.key] ? "text-emerald-500!" : "text-rose-500!"}>{formData[section.key] ? "ACTIVO" : "INACTIVO"}</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={formData[section.key] ?? false}
                            onChange={(e) => handleChange(section.key, e.target.checked)}
                            className={`w-5 h-5 rounded-md! bg-black/60! border-white/20! ${theme.accent} focus:ring-0! transition-all! cursor-pointer!`}
                          />
                        </label>
                      ) : (
                        <input
                          type={section.type || "text"}
                          value={formData[section.key] ?? ""}
                          onChange={(e) => handleChange(section.key, e.target.value)}
                          className={`w-full bg-black/60! border! border-white/10! rounded-md! px-3.5 py-2.5 text-[12px] text-white! font-bold transition-all! ${theme.input} focus:outline-none! focus:bg-black!`}
                          placeholder={`SET_${section.label.toUpperCase()}...`}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="relative group/data">
                      {section.type === "boolean" ? (
                        <div className="flex items-center">
                          <div className={`px-2.5 py-1 rounded-md border flex items-center gap-2 ${value ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full bg-current ${value ? "animate-pulse" : ""}`} />
                            <span className="text-[10px] font-black uppercase tracking-wider">{value ? "ACTIVO" : "INACTIVO"}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-md! bg-white/[0.01]! border! border-white/5! transition-all! group-hover/field:bg-white/[0.02]!">
                          <p className={`text-[13px] font-black text-white! tracking-wide transition-all! ${!hasValue ? "italic opacity-10" : "group-hover/field:pl-1"}`}>
                            {hasValue ? value : "NULL"}
                          </p>
                          {section.sub && hasValue && (
                            <p className="mt-1 text-[8px] font-bold text-white/15 uppercase tracking-[0.1em] leading-none">
                              {section.sub(data)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* LOGS / HISTORIAL */}
        {activeTab === "historial" && !isEdit && !hideTabs && children && (
          <div className="animate-in! fade-in! slide-in-from-bottom-3! duration-700!">
            <div className="flex items-center gap-3 mb-4 opacity-20">
              <div className="h-px flex-1 bg-white/20!" />
              <span className="text-[9px] font-black text-white! uppercase tracking-[0.3em]">Log_Trace</span>
              <div className="h-px flex-1 bg-white/20!" />
            </div>
            <div className="rounded-md! border! border-white/5! bg-black/20! p-4! overflow-hidden">
              {children}
            </div>
          </div>
        )}
      </div>
    </ModalDetalle>
  );

  if (isStandalone) return content;

  return (
    <ModalDetalleBase open={open} onClose={onClose} width={width}>
      {content}
    </ModalDetalleBase>
  );
};

export default ModalDetalleGenerico;
