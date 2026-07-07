const TarjetaInformacion = ({
  titulo,
  color = "text-[var(--color-brand-primary)]",
  numero,
  descripcion,
  valorMoneda,
  icono
}) => {
  return (
    <div className="p-5 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)] rounded-[16px] border border-[var(--color-neutral-border)] hover:border-[var(--color-brand-soft)] hover:shadow-md transition-all duration-300 group overflow-hidden relative">
      <div className="flex items-start justify-between">
        <div className="space-y-1 z-10">
          <p className="text-[13px] font-semibold text-[var(--color-neutral-text-muted)] uppercase tracking-wide">
            {titulo}
          </p>
          <h3 className={`text-2xl font-bold tracking-tight text-[var(--color-neutral-text-main)]`}>
            {valorMoneda && <span className="text-lg mr-1 text-[var(--color-neutral-text-muted)] font-medium">$</span>}
            {typeof numero === "number" ? numero.toLocaleString("es-AR") : numero}
          </h3>
          {descripcion && (
            <p className="text-[13px] font-medium text-[var(--color-neutral-text-muted)] flex items-center gap-1 mt-1">
              {descripcion}
            </p>
          )}
        </div>

        {icono && (
          <div className={`p-2.5 rounded-[12px] bg-[var(--color-brand-soft)] ${color} transition-transform group-hover:scale-105`}>
            {icono}
          </div>
        )}
      </div>

      {/* Subtle background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-500 scale-150">
        {icono}
      </div>
    </div>
  );
};

export default TarjetaInformacion;
