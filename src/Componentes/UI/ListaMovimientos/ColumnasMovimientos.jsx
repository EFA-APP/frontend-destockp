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
            className="bg-yellow-400/40 text-[var(--primary)] px-0.5 rounded font-black italic"
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
          <span className="text-[10px] text-[var(--primary)] font-black uppercase tracking-wider">
            {parts[0]}
          </span>
          <span className="text-[14px] font-black tracking-tighter">
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
        <span className="font-black text-[14px] uppercase tracking-tight text-black">
          <Highlight text={valor} term={busqueda} />
        </span>
        {fila.descripcion && (
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest pt-1">
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
          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${config.estilo}`}
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
            className={`text-[16px] font-black tracking-tighter ${config.color}`}
          >
            {config.simbolo}
            {valor}
          </span>
          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
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
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
          <span className="text-[10px] font-black text-[var(--primary)] uppercase">
            {valor?.charAt(0)}
          </span>
        </div>
        <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">
          <Highlight text={valor} term={busqueda} />
        </span>
      </div>
    ),
  },
];
