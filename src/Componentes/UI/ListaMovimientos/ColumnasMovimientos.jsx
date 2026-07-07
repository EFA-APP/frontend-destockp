const formatFecha = (fechaStr) => {
  try {
    const fecha = new Date(fechaStr);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(fecha);
  } catch (e) {
    return fechaStr;
  }
};

const getTipoConfig = (tipo) => {
  switch (tipo) {
    case "INGRESO":
      return {
        estilo: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        simbolo: "+",
        color: "text-emerald-500",
      };
    case "EGRESO":
      return {
        estilo: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        simbolo: "-",
        color: "text-rose-500",
      };
    case "AJUSTE":
      return {
        estilo: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        simbolo: "±",
        color: "text-amber-500",
      };
    default:
      return {
        estilo: "text-gray-500 bg-gray-500/10 border-gray-500/20",
        simbolo: "",
        color: "text-gray-500",
      };
  }
};

const Highlight = ({ text, term }) => {
  if (!term || !text) return text;
  const parts = String(text).split(new RegExp(`(${term})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark
            key={i}
            className="bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)] px-1 rounded-[4px] font-bold"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
};

export const ColumnasMovimientos = (busqueda) => [
  {
    key: "fecha",
    etiqueta: "Fecha",
    renderizar: (valor) => {
      const parts = formatFecha(valor).split(",");
      return (
        <div className="flex flex-col">
          <span className="text-[12px] text-[var(--color-neutral-text-muted)] font-semibold">
            {parts[0]}
          </span>
          <span className="text-[13px] font-bold text-[var(--color-neutral-text-main)]">
            {parts[1]}
          </span>
        </div>
      );
    },
  },
  {
    key: "nombreArticulo",
    etiqueta: "Producto",
    renderizar: (valor, fila, busqueda) => (
      <div className="flex flex-col min-w-[220px]">
        <span className="font-bold text-[14px] text-[var(--color-neutral-text-main)]">
          <Highlight text={valor} term={busqueda} />
        </span>
        {fila.descripcion && (
          <span className="text-[12px] text-[var(--color-neutral-text-muted)] pt-0.5">
            <Highlight
              text={fila.descripcion?.replace(/_/g, " ")}
              term={busqueda}
            />
          </span>
        )}
      </div>
    ),
  },
  {
    key: "tipoMovimiento",
    etiqueta: "Tipo",
    renderizar: (valor) => {
      const config = getTipoConfig(valor);
      return (
        <span
          className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold border ${config.estilo}`}
        >
          {valor}
        </span>
      );
    },
  },
  {
    key: "cantidad",
    etiqueta: "Cantidad",
    renderizar: (valor, fila) => {
      const config = getTipoConfig(fila.tipoMovimiento);
      return (
        <div className="flex flex-col items-start md:items-end pr-4">
          <span
            className={`text-[15px] font-bold ${config.color}`}
          >
            {config.simbolo}
            {valor}
          </span>
          <span className="text-[11px] font-medium text-[var(--color-neutral-text-muted)]">
            {fila.unidadMedida || ""}
          </span>
        </div>
      );
    },
  },
  {
    key: "nombreUsuario",
    etiqueta: "Operador",
    renderizar: (valor) => (
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-[8px] bg-[var(--color-brand-soft)] flex items-center justify-center border border-[var(--color-brand-primary)]/20">
          <span className="text-[12px] font-bold text-[var(--color-brand-primary)]">
            {valor?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <span className="text-[13px] font-medium text-[var(--color-neutral-text-main)]">
          <Highlight text={valor} term={busqueda} />
        </span>
      </div>
    ),
  },
];
