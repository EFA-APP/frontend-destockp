export const columnasMisComprobantesAFIP = [
  // 📄 Comprobante
  {
    key: "numero",
    etiqueta: "Comprobante",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div>
        <div className="font-medium">
          {fila.tipo} {fila.puntoVenta}-{valor}
        </div>
        <div className="text-xs text-gray-100/50">CAE: {fila.cae || "—"}</div>
      </div>
    ),
  },

  // 🏢 Proveedor
  {
    key: "razonSocial",
    etiqueta: "Proveedor",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div>
        <div className="font-medium">{valor}</div>
        <div className="text-xs text-gray-100/50">CUIT {fila.cuitEmisor}</div>
      </div>
    ),
  },

  // 📅 Fecha
  {
    key: "fechaEmision",
    etiqueta: "Fecha",
    filtrable: true,
    renderizar: (valor) => (
      <span className="text-sm">
        {new Date(valor).toLocaleDateString("es-AR")}
      </span>
    ),
  },

  // 💰 Importe
  {
    key: "total",
    etiqueta: "Importe",
    filtrable: false,
    renderizar: (valor) => (
      <span
        className={`font-semibold ${
          valor < 0 ? "text-red-400" : "text-green-400"
        }`}
      >
        ${valor.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
      </span>
    ),
  },

  // 🚦 Estado
  {
    key: "estado",
    etiqueta: "Estado",
    filtrable: true,
    renderizar: (valor) => {
      const estilos = {
        pendiente: "bg-yellow-700/20 text-yellow-400",
        importado: "bg-green-700/20 text-green-400",
        observado: "bg-red-700/20 text-red-400",
      };
      const tipo = valor?.toLowerCase();

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs border-[.5px] font-medium ${
            estilos[tipo]
          }`}
        >
          {valor?.toUpperCase()}
        </span>
      );
    },
  },
];
