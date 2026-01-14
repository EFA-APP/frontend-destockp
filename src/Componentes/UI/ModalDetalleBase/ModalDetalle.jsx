import React from "react";

// components/ui/ModalCard.jsx
const ModalDetalle = ({ title, icon, onClose, children, footer }) => {
  return (
    <div
      className={`
        w-full
        rounded-2xl
        bg-gradient-to-b from-[#2b2e33] to-[#1f2226]
        shadow-[0_20px_60px_rgba(0,0,0,0.6)]
        border border-white/10
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
              {icon}
            </div>
          )}
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>

        <button
          onClick={onClose}
          className="text-[var(--primary-light)]! hover:text-orange-900! transition cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-4">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
          {footer}
        </div>
      )}
    </div>
  );
};

export default ModalDetalle;
