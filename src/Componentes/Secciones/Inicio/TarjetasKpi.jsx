import React from "react";

const TarjetaKpi = ({
  icon,
  title,
  value,
  subtitle,
  footer,
  trend, // "up" | "down" | "neutral"
  actionLabel,
}) => {
  const trendStyles = {
    up: {
      text: "text-[var(--secondary)]",
      bg: "bg-[var(--secondary-subtle)]",
      label: "↑",
    },
    down: {
      text: "text-red-700",
      bg: "bg-red-700/10",
      label: "↓",
    },
    neutral: {
      text: "text-[var(--text-muted)]",
      bg: "bg-black/5",
      label: "•",
    },
  };

  const current = trendStyles[trend || "neutral"];

  return (
    <div className="relative overflow-hidden rounded-xl bg-[var(--surface)] p-4 border border-[var(--border-subtle)] shadow-sm hover:border-[var(--border-medium)] ">
      {/* CONTENIDO */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            {title}
          </div>
          <div className="p-1.5 rounded-lg bg-[var(--surface-hover)] text-[var(--primary)] border border-[var(--border-subtle)]">
            {React.isValidElement(icon)
              ? React.cloneElement(icon, { size: 14 })
              : icon}
          </div>
        </div>

        {/* Valor y Trend */}
        <div className="flex items-baseline gap-2 mb-0.5">
          <div className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            {value}
          </div>
          {footer && (
            <span
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${current.bg} ${current.text}`}
            >
              {current.label} {footer}
            </span>
          )}
        </div>

        {/* Subtexto */}
        {subtitle && (
          <div className="text-[13px] text-[var(--text-secondary)] mt-0.5 leading-relaxed font-medium">
            {subtitle}
          </div>
        )}

        {/* Acción */}
        {actionLabel && (
          <div className="mt-auto pt-3 flex justify-end">
            <button className="cursor-pointer text-[12px]! font-bold! px-2.5 py-1.5 rounded-md! bg-[var(--primary-light)]/30! hover:bg-[var(--primary)]/30! text-[var(--primary)]!  border border-[var(--border-subtle)] uppercase tracking-wider">
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TarjetaKpi;
