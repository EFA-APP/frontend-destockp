import { CalendarioIcono } from "../../../assets/Icons";

const FechaInput = ({
  label,
  value,
  onChange,
  size = "sm",
  className = "",
}) => {
  const sizes = {
    sm: "h-9 text-[13px] pl-4 pr-10",
    md: "h-10 text-sm pl-4 pr-10",
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <span className="text-[13px] font-semibold text-[var(--text-muted)] uppercase  mb-1 ml-1">
          {label}
        </span>
      )}

      <div className="relative group">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            ${sizes[size]}
            w-full
            rounded-md!
            bg-[var(--border-subtle)]! 
            border border-black/10!
            text-black!
            placeholder:text-black/20
            focus:outline-none
            focus:border-amber-700/50!
            
            appearance-none
            ${className}
          `}
        />
      </div>
    </div>
  );
};

export default FechaInput;
