import { CalendarDays } from "lucide-react";
import { CalendarioIcono } from "../../../assets/Icons";

const FechaInput = ({ label, value, onChange, size = "sm" }) => {
  const sizes = {
    sm: "h-8 text-xs pl-9 pr-2",
    md: "h-9 text-sm pl-10 pr-3",
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs text-white pb-1">{label}</span>}

      <div className="relative">
        {/* Icono */}
        <span className="absolute top-[7px] right-3">
          <CalendarioIcono size={18} color={"var(--primary)"} />
        </span>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            ${sizes[size]}
            w-full
            rounded-md!
            bg-[var(--fill)]
            border border-[var(--primary)]
            text-white!
            focus:outline-none
            focus:ring-1 focus:ring-[var(--primary-opacity-10)]!
          `}
        />
      </div>
    </div>
  );
};

export default FechaInput;
