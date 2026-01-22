const estadoStyle = {
  importado: "bg-green-500/20 text-green-400 border-green-400/30",
  pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
};

export const columnasFacturasProveedor = [
  {
    key: "numero",
    etiqueta: "Comprobante",
    renderizar: (valor, fila) => (
      <div>
        <div className="font-medium">{`${fila.puntoVenta}-${valor}`}</div>
        <div className="flex justify-start items-center gap-2">
          <div className="text-xs text-gray-100/50">
            {`Tipo:  ${fila.tipo}`}{" "}
          </div>
          <div
            className={` w-2 h-2 rounded-full shadow-lg! ${
              fila.isBlanco
                ? "bg-green-400 shadow-green-300!"
                : "bg-red-400 shadow-red-300!"
            } `}
          ></div>
        </div>
      </div>
    ),
  },
  {
    key: "fechaEmision",
    etiqueta: "Fecha",
    renderizar: (valor) => (
      <span className="text-sm">
        {new Date(valor).toLocaleDateString("es-AR")}
      </span>
    ),
  },
  {
    key: "razonSocial",
    etiqueta: "Proveedor",
    renderizar: (valor) => <span className="font-medium">{valor}</span>,
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
          {valor ? valor.replace("_", " ").toUpperCase() : "-"}
        </span>
      );
    },
  },
  {
    key: "total",
    etiqueta: "Total",
    renderizar: (valor) => (
      <span className="font-semibold text-green-400">
        ${valor.toLocaleString("es-AR")}
      </span>
    ),
  },
];
