import { CalendarioIcono } from "../../../assets/Icons";

const FechaInput = ({ label, value, onChange, size = "sm", className = "" }) => {
  const sizes = {
    sm: "h-9 text-[11px] pl-4 pr-10",
    md: "h-10 text-sm pl-4 pr-10",
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1 ml-1">{label}</span>}

      <div className="relative group">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            ${sizes[size]}
            w-full
            rounded-md!
            bg-zinc-900/50!
            border border-white/10!
            text-white!
            placeholder:text-white/20
            focus:outline-none
            focus:border-amber-500/50!
            transition-all
            appearance-none
            ${className}
          `}
        />
        {/* Icono */}
        <span className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none opacity-40 group-focus-within:opacity-100 transition-opacity">
          <CalendarioIcono size={14} color={"var(--primary)"} />
        </span>
      </div>
    </div>
  );
};

export default FechaInput;
