import { useState } from "react";
import { OjosIcono } from "../../../assets/Icons";

const InputReutilizable = ({ label, tipo, valor, onChange, ...props }) => {
  const [mostrar, setMostrar] = useState(false);
  const esPassword = tipo === "password";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-0.5">
        {label}
      </label>
      <div className="relative w-full group">
        <input
          className="flex h-10 w-full rounded-md px-4 text-[13px] bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-white placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all outline-none disabled:opacity-50"
          type={esPassword && mostrar ? "text" : tipo}
          value={valor}
          onChange={onChange}
          {...props}
        />
        {esPassword && (
          <button 
             type="button" 
             onClick={() => setMostrar(!mostrar)} 
             className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-all duration-200"
          >
            <div className="relative flex items-center justify-center">
                 <OjosIcono size={18} />
                 {!mostrar && (
                      <div className="absolute top-1/2 left-1/2 w-4 h-[1.5px] bg-rose-500 rotate-45 -translate-x-1/2 -translate-y-1/2 shadow-sm shadow-black/50"></div>
                 )}
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default InputReutilizable;
