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
      text: "text-[var(--color-brand-primary)]",
      bg: "bg-[var(--color-brand-soft)]",
      label: "↑",
    },
    down: {
      text: "text-red-600",
      bg: "bg-red-50",
      label: "↓",
    },
    neutral: {
      text: "text-[var(--color-neutral-text-muted)]",
      bg: "bg-gray-100",
      label: "•",
    },
  };

  const current = trendStyles[trend || "neutral"];

  return (
    <div className="relative overflow-hidden rounded-[16px] bg-white p-5 border border-[var(--color-neutral-border)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow duration-300">
      {/* CONTENIDO */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-[var(--color-neutral-text-muted)]">
            {title}
          </div>
          <div className="p-2 rounded-[12px] bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)] transition-transform hover:scale-105">
            {React.isValidElement(icon)
              ? React.cloneElement(icon, { size: 16 })
              : icon}
          </div>
        </div>

        {/* Valor y Trend */}
        <div className="flex items-baseline gap-2.5 mb-1">
          <div className="text-[26px] font-bold text-[var(--color-neutral-text-main)] tracking-tight">
            {value}
          </div>
          {footer && (
            <span
              className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${current.bg} ${current.text}`}
            >
              {current.label} {footer}
            </span>
          )}
        </div>

        {/* Subtexto */}
        {subtitle && (
          <div className="text-[14px] text-[var(--color-neutral-text-muted)] mt-1 font-medium">
            {subtitle}
          </div>
        )}

        {/* Acción */}
        {actionLabel && (
          <div className="mt-auto pt-4 flex justify-end">
            <button className="cursor-pointer text-[13px] font-semibold px-3 py-1.5 rounded-[8px] bg-gray-50 hover:bg-gray-100 text-[var(--color-neutral-text-main)] border border-[var(--color-neutral-border)] transition-colors">
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TarjetaKpi;
