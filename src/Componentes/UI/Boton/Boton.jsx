const Boton = ({ 
  texto, 
  variante = "primario", 
  bg, 
  className = "", 
  children,
  ...props 
}) => {
  let baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 px-5 py-2.5 text-[14px] cursor-pointer";
  
  let variantStyles = "";
  
  switch (variante) {
    case "secundario":
      variantStyles = "bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)] hover:bg-[var(--color-brand-light)]";
      break;
    case "terciario":
      variantStyles = "bg-transparent text-[var(--color-brand-primary)] hover:underline px-0 py-0";
      break;
    case "primario":
    default:
      variantStyles = "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-hover)] shadow-sm";
      break;
  }

  // Compatibilidad con prop 'bg' anterior por si se usaba para forzar un color
  const bgClass = bg ? bg : variantStyles;

  return (
    <button
      className={`${baseStyles} ${bgClass} ${className}`}
      {...props}
    >
      {children || texto}
    </button>
  );
};

export default Boton;
