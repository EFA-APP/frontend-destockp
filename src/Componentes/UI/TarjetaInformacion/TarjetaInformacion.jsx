const TarjetaInformacion = ({
  titulo,
  color = "text-[var(--text-primary)]",
  numero,
  descripcion,
  valorMoneda,
  icono
}) => {
  return (
    <div className="p-4 bg-[var(--surface)] shadow-md rounded-md! border border-[var(--border-subtle)] hover:border-[var(--primary)]/30  group overflow-hidden relative">
      <div className="flex items-start justify-between">
        <div className="space-y-1 z-10">
          <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            {titulo}
          </p>
          <h3 className={`text-xl font-bold tracking-tight ${color}`}>
            {valorMoneda && <span className="text-sm mr-0.5">$</span>}
            {typeof numero === "number" ? numero.toLocaleString("es-AR") : numero}
          </h3>
          {descripcion && (
            <p className="text-[12px] font-medium text-[var(--text-muted)] flex items-center gap-1">
              {descripcion}
            </p>
          )}
        </div>

        {icono && (
          <div className={`p-2 rounded-md! bg-[var(--fill-secondary)]/10 ${color}  `}>
            {icono}
          </div>
        )}
      </div>

      {/* Subtle background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:opacity-10 ">
        {icono}
      </div>
    </div>
  );
};

export default TarjetaInformacion;
