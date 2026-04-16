import React from "react";

const ModalDetalle = ({
  title,
  icon,
  onClose,
  children,
  footer,
  accentColor = "default",
  isStandalone = false,
}) => {
  const colors = {
    default: {
      iconBg: "bg-[var(--primary)]/10",
      iconText: "text-[var(--primary)]",
      iconBorder: "border-[var(--primary)]/10",
      line: "bg-[var(--primary)]/40",
      bgGradient:
        "bg-gradient-to-br from-[#1a1610]! via-[#0f0f0f]! to-[#0a0a0a]!",
      glow: "bg-[var(--primary)]/5",
    },
    amber: {
      iconBg: "bg-amber-500/10",
      iconText: "text-amber-500",
      iconBorder: "border-amber-500/10",
      line: "bg-amber-500/40",
      bgGradient:
        "bg-gradient-to-br from-[#1a1610]! via-[#0f0f0f]! to-[#0a0a0a]!",
      glow: "bg-amber-500/5",
    },
    emerald: {
      iconBg: "bg-emerald-500/10",
      iconText: "text-emerald-500",
      iconBorder: "border-emerald-500/10",
      line: "bg-emerald-500/40",
      bgGradient:
        "bg-gradient-to-br from-[#101a14]! via-[#0f0f0f]! to-[#0a0a0a]!",
      glow: "bg-emerald-500/5",
    },
    blue: {
      iconBg: "bg-blue-500/10",
      iconText: "text-blue-500",
      iconBorder: "border-blue-500/10",
      line: "bg-blue-500/40",
      bgGradient:
        "bg-gradient-to-br from-[#10141a]! via-[#0f0f0f]! to-[#0a0a0a]!",
      glow: "bg-blue-500/5",
    },
    rose: {
      iconBg: "bg-rose-500/10",
      iconText: "text-rose-500",
      iconBorder: "border-rose-500/10",
      line: "bg-rose-500/40",
      bgGradient:
        "bg-gradient-to-br from-[#1a1012]! via-[#0f0f0f]! to-[#0a0a0a]!",
      glow: "bg-rose-500/5",
    },
    indigo: {
      iconBg: "bg-indigo-500/10",
      iconText: "text-indigo-500",
      iconBorder: "border-indigo-500/10",
      line: "bg-indigo-500/40",
      bgGradient:
        "bg-gradient-to-br from-[#12101a]! via-[#0f0f0f]! to-[#0a0a0a]!",
      glow: "bg-indigo-500/5",
    },
  };

  const theme = colors[accentColor] || colors.amber;

  return (
    <div
      className={`
        relative overflow-hidden
        w-full 
        flex flex-col
        ${
          isStandalone
            ? "bg-transparent! border-none!"
            : "bg-[var(--surface-active)]! shadow-2xl border-x md:border border-white/10 rounded-md!"
        }
      `}
    >
      {!isStandalone && (
        <div
          className={`absolute -top-24 -right-24 w-64 h-64 rounded-full ${theme.glow} blur-[100px] pointer-events-none`}
        />
      )}

      {/* Header - Conditional for Standalone */}
      {!isStandalone && (
        <div
          className={`relative z-10 flex items-center justify-between px-5 py-4 md:px-6 md:py-5 border-b border-white/5 shadow-sm shrink-0`}
        >
          <div className="flex items-center gap-3.5">
            {icon && (
              <div
                className={`p-2 rounded-md ${theme.iconBg} ${theme.iconText} border ${theme.iconBorder} shadow-inner`}
              >
                {React.cloneElement(icon, { size: 18 })}
              </div>
            )}
            <div>
              <h2 className="text-sm md:text-base font-bold text-white tracking-tight">
                {title}
              </h2>
              <div className={`h-0.5 w-4 ${theme.line} rounded-full mt-0.5`} />
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-white/20 hover:text-white hover:bg-white/5 transition-all cursor-pointer active:scale-90"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      {/* Body - Clean & Spaced */}
      <div
        className={`${isStandalone ? "p-0" : "flex-1 px-4 py-5 md:px-6 md:py-6 overflow-y-auto custom-scrollbar"}`}
      >
        {children}
      </div>

      {/* Footer - Solid & Formal */}
      {footer && (
        <div
          className={`px-4 py-4 md:px-6 md:py-5 border-t border-white/5 ${isStandalone ? "bg-black/5" : "bg-black/20"} flex flex-col sm:flex-row justify-end gap-3 shrink-0 rounded-b-md`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default ModalDetalle;
