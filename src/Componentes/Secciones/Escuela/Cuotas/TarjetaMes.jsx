import React from "react";

const TarjetaMes = ({ mes, index, activo, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border   group overflow-hidden ${
        activo
          ? "bg-[var(--primary)] border-[var(--primary)] shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] scale-[1.02]"
          : "bg-[var(--surface)] border-black/5 hover:border-black/20 hover:bg-white/[0.05]"
      }`}
    >
      <span
        className={`text-[15px] font-black uppercase tracking-widest  ${
          activo ? "text-black" : "text-black/60 group-hover:text-black"
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
