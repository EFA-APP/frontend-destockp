const Select = ({ label, valor, setValor, options, className = "" }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[13px] font-medium text-[var(--color-neutral-text-muted)] pl-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="
            flex h-[42px] w-full rounded-[12px] px-4 text-[14px] 
            bg-[var(--color-neutral-bg)] border border-transparent 
            text-[var(--color-neutral-text-main)] 
            focus:border-[var(--color-brand-primary)] focus:bg-white 
            focus:ring-1 focus:ring-[var(--color-brand-primary)] 
            outline-none transition-colors duration-200
            appearance-none cursor-pointer
          "
        >
          {options.map((option) => (
            <option
              key={option.valor}
              className="bg-white text-black py-2"
              value={option.valor}
            >
              {option.texto}
            </option>
          ))}
        </select>
        {/* Flecha personalizada */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-neutral-placeholder)] group-hover:text-[var(--color-neutral-text-main)] transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
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
