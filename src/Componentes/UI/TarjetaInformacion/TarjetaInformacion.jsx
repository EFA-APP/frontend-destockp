const TarjetaInformacion = ({
  titulo,
  color = "text-[var(--text-primary)]",
  numero,
  descripcion,
  valorMoneda,
  icono
}) => {
  return (
    <div className="p-4 bg-[var(--surface)] shadow-md rounded-xl border border-[var(--border-subtle)] hover:border-[var(--primary)]/30 transition-all group overflow-hidden relative">
      <div className="flex items-start justify-between">
        <div className="space-y-1 z-10">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            {titulo}
          </p>
          <h3 className={`text-xl font-bold tracking-tight ${color}`}>
            {valorMoneda && <span className="text-sm mr-0.5">$</span>}
            {typeof numero === "number" ? numero.toLocaleString("es-AR") : numero}
          </h3>
          {descripcion && (
            <p className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-1">
              {descripcion}
            </p>
          )}
        </div>

        {icono && (
          <div className={`p-2 rounded-lg bg-[var(--fill-secondary)]/10 ${color} group-hover:scale-110 transition-transform`}>
            {icono}
          </div>
        )}
      </div>

      {/* Subtle background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        {icono}
      </div>
    </div>
  );
};

export default TarjetaInformacion;
