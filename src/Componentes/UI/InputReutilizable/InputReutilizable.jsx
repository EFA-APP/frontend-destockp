import { useState } from "react";
import { OjosIcono } from "../../../assets/Icons";

const InputReutilizable = ({ label, tipo, valor, onChange, ...props }) => {
  const [mostrar, setMostrar] = useState(false);
  const esPassword = tipo === "password";

  return (
    <div>
      <label className="text-xs mb-2 block font-normal text-white text-[15px]">
        {label}
      </label>
      <div className="relative w-full">
        <input
          className="flex h-8 w-full rounded-md px-3 py-4 text-sm border-[0.2px] border-gray-200/10 text-[var(--primary)] focus:border-[var(--primary)] pr-10 bg-[var(--surface-hover)]/30"
          type={esPassword && mostrar ? "text" : tipo}
          value={valor}
          onChange={onChange}
          {...props}
        />
        {esPassword && (
          <button 
             type="button" 
             onClick={() => setMostrar(!mostrar)} 
             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-200"
          >
               <div className="relative flex items-center justify-center">
                    <OjosIcono size={16} />
                    {!mostrar && (
                         <div className="absolute top-1/2 left-1/2 w-4 h-[1.5px] bg-red-500 rotate-45 -translate-x-1/2 -translate-y-1/2 shadow-sm"></div>
                    )}
               </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default InputReutilizable;
