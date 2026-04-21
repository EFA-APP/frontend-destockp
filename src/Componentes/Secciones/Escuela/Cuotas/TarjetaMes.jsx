import React from "react";

const TarjetaMes = ({ mes, index, activo, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 group overflow-hidden ${
        activo
          ? "bg-[var(--primary)] border-[var(--primary)] shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] scale-[1.02]"
          : "bg-[var(--surface)] border-white/5 hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <span
        className={`text-[13px] font-black uppercase tracking-widest transition-colors ${
          activo ? "text-black" : "text-white/60 group-hover:text-white"
        }`}
      >
        {mes}
      </span>

      {/* Glow Effect only on active */}
      {activo && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
      )}
    </button>
  );
};

export default TarjetaMes;
