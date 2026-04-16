const Select = ({ label, valor, setValor, options, className = "" }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em] ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="
            w-full 
            h-9 
            pl-3 
            pr-10 
            rounded-xl! 
            border 
            border-white/10 
            bg-zinc-950/40! 
            text-[12px] 
            font-bold 
            text-white/80 
            backdrop-blur-md 
            appearance-none 
            cursor-pointer 
            focus:outline-none 
            focus:border-[var(--primary)]/50 
            focus:text-white 
            transition-all 
            duration-300
          "
        >
          {options.map((option) => (
            <option
              key={option.valor}
              className="bg-[#121212] text-white py-2"
              value={option.valor}
            >
              {option.texto}
            </option>
          ))}
        </select>
        {/* Flecha personalizada */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Select;
