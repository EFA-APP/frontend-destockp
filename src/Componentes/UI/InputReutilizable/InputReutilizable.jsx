import { useState } from "react";
import { OjosIcono } from "../../../assets/Icons";

const InputReutilizable = ({ label, tipo, valor, onChange, className = "", ...props }) => {
  const [mostrar, setMostrar] = useState(false);
  const esPassword = tipo === "password";

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-[13px] font-medium text-[var(--color-neutral-text-muted)] pl-1">
          {label}
        </label>
      )}
      <div className="relative w-full group">
        <input
          className="flex h-[42px] w-full rounded-[12px] px-4 text-[14px] bg-[var(--color-neutral-bg)] border border-transparent text-[var(--color-neutral-text-main)] placeholder:text-[var(--color-neutral-placeholder)] focus:border-[var(--color-brand-primary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-brand-primary)] outline-none disabled:opacity-50 transition-colors duration-200"
          type={esPassword && mostrar ? "text" : tipo}
          value={valor}
          onChange={onChange}
          {...props}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setMostrar(!mostrar)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-placeholder)] hover:text-[var(--color-neutral-text-main)] transition-colors cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <OjosIcono size={18} />
              {!mostrar && (
                <div className="absolute top-1/2 left-1/2 w-4 h-[1.5px] bg-rose-700 rotate-45 -translate-x-1/2 -translate-y-1/2 shadow-sm shadow-black/50"></div>
              )}
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default InputReutilizable;
