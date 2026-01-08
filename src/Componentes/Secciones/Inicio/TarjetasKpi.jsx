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
      glow: "from-green-500/30",
      line: "stroke-green-400",
      text: "text-green-400",
    },
    down: {
      glow: "from-red-500/30",
      line: "stroke-red-400",
      text: "text-red-400",
    },
    neutral: {
      glow: "from-[var(--color-primary)]/30",
      line: "stroke-[var(--color-primary)]",
      text: "text-[var(--color-primary)]",
    },
  };

  const current = trendStyles[trend || "neutral"];

  return (
    <div className="relative overflow-hidden rounded-xl bg-[var(--fill)] p-4 border border-white/5 shadow-lg">
      
      {/* Glow inferior */}
      <div
        className={`absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${current.glow} to-transparent`}
      />

      {/* CONTENIDO */}
      <div className="relative z-10 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span className="text-[var(--color-primary)]">{icon}</span>
          <span>{title}</span>
        </div>

        {/* Valor */}
        <div className="text-2xl font-semibold text-white">
          {value}
        </div>

        {/* Subtexto */}
        {subtitle && (
          <div className="text-sm text-gray-400">
            {subtitle}
          </div>
        )}

        {/* Footer info */}
        {footer && (
          <div className={`text-sm ${current.text}`}>
            {footer}
          </div>
        )}

        {/* Línea ondulada */}
        <svg
          viewBox="0 0 100 20"
          className="w-full h-6 mt-2"
          preserveAspectRatio="none"
        >
          <path
            d="M0 15 Q 15 5 30 10 T 60 10 T 100 5"
            fill="none"
            strokeWidth="2"
            className={current.line}
          />
        </svg>

        {/* Acción */}
        {actionLabel && (
          <div className="flex justify-end">
            <button className="cursor-pointer text-xs px-3 py-1 rounded-md! bg-[var(--primary)]/20! hover:bg-[var(--primary)]/60! text-white! transition">
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TarjetaKpi;
