const estadoStyle = {
  pagado: "bg-green-500/20 text-green-400 border-green-400/30",
  pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
  anulado: "bg-red-500/20 text-red-400 border-red-400/30",
};

export const columnasRecibos = [
  {
    key: "numero",
    etiqueta: "Recibo",
    renderizar: (valor, fila) => (
      <div>
        <div className="font-medium ">{`${fila.prefijo}-${valor}`}</div>
        <div className="text-xs text-gray-400 mt-0.5">
          {new Date(fila.fecha).toLocaleDateString("es-AR")}
        </div>
      </div>
    ),
  },
  {
    key: "alumnoNombre",
    etiqueta: "Alumno",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div>
        <div className="font-medium">{valor}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
            {fila.curso}
          </span>
        </div>
      </div>
    ),
  },
  {
    key: "concepto",
    etiqueta: "Concepto",
    renderizar: (valor, fila) => (
      <div>
        <div className="text-sm">{valor}</div>
        {fila.observaciones && (
          <div className="text-xs text-gray-400 mt-0.5 italic line-clamp-1">
            {fila.observaciones}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "metodoPago",
    etiqueta: "Método",
    filtrable: true,
    renderizar: (valor) => (
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{valor}</span>
      </div>
    ),
  },
  {
    key: "total",
    etiqueta: "Monto",
    renderizar: (valor, fila) => (
      <div>
        <div className="font-semibold text-green-400">
          ${valor.toLocaleString("es-AR")}
        </div>
        {(fila.descuento > 0 || fila.interes > 0) && (
          <div className="flex gap-2 mt-0.5 text-xs">
            {fila.descuento > 0 && (
              <span className="text-blue-400">-{fila.descuento}% desc.</span>
            )}
            {fila.interes > 0 && (
              <span className="text-red-400">+{fila.interes}% int.</span>
            )}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "diasAtraso",
    etiqueta: "Atraso",
    renderizar: (valor) => {
      if (valor === 0) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-400/30 w-[72px]">
            A tiempo
          </span>
        );
      }
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-orange-500/20 text-orange-400 border border-orange-400/30">
          {valor} {valor === 1 ? "día" : "días"}
        </span>
      );
    },
  },
  {
    key: "estado",
    etiqueta: "Estado",
    filtrable: false,
    renderizar: (valor) => {
      const tipo = valor.toLowerCase();
      const style =
        estadoStyle[tipo] || "bg-gray-500/20 text-gray-400 border-gray-400/30";

      return (
        <span
          className={`
          inline-flex items-center px-2 py-0.5
          text-xs font-medium rounded-full
          border ${style}
        `}
        >
          {valor ? valor.charAt(0).toUpperCase() + valor.slice(1) : "-"}
        </span>
      );
    },
  },
];
