import React from "react";

const TarjetaMes = ({ mes, index, activo, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 group overflow-hidden ${
        activo
          ? "bg-[var(--primary)] border-[var(--primary)] shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] scale-[1.02]"
          : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      {/* Indicador de número de mes sutil */}
      <span
        className={`absolute top-2 left-2 text-[8px] font-black tracking-tighter transition-colors ${
          activo ? "text-black/40" : "text-white/70"
        }`}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
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
