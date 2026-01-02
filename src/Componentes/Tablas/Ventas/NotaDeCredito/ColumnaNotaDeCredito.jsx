const estadoNotaCreditoStyle = {
  emitida: "bg-blue-500/20 text-blue-400 border-blue-400/30",
  aplicada: "bg-green-500/20 text-green-400 border-green-400/30",
  anulada: "bg-red-500/20 text-red-400 border-red-400/30",
};

export const columnasNotasCredito = [
  {
    key: "numero",
    etiqueta: "Nota",
    renderizar: (valor, fila) => (
      <div>
        <div className="font-medium">{`${fila.prefijo}-${valor}`}</div>
        <div className="flex justify-start items-center gap-2">
          <div className="text-xs text-gray-100/50">
            {`Nota de credito-${fila.tipo}`}{" "}
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
    key: "fecha",
    etiqueta: "Fecha",
    renderizar: (valor) => (
      <span className="text-sm">
        {new Date(valor).toLocaleDateString("es-AR")}
      </span>
    ),
  },
  {
    key: "numeroFacturaOrigen",
    etiqueta: "Factura",
    renderizar: (valor, fila) => (
      <div>
        <div className="font-medium">{`${fila.tipoFactura}-${valor}`}</div>
        <div className="text-xs text-gray-100/50">Documento origen</div>
      </div>
    ),
  },
  {
    key: "cliente",
    etiqueta: "Cliente",
    filtrable: true,
    renderizar: (valor) => <span className="font-medium">{valor}</span>,
  },
  {
    key: "estado",
    etiqueta: "Estado",
    renderizar: (valor) => {
      const estado = valor?.toLowerCase();
      const style =
        estadoNotaCreditoStyle[estado] ||
        "bg-gray-500/20 text-gray-400 border-gray-400/30";

      return (
        <span
          className={`
            inline-flex items-center
            text-xs font-medium border
            py-0.5 px-1.5 rounded-md
            ${style}
          `}
        >
          {valor?.toUpperCase() || "-"}
        </span>
      );
    },
  },
  {
    key: "total",
    etiqueta: "Total",
    renderizar: (valor) => {
      const esNegativo = valor < 0;

      return (
        <span
          className={`font-semibold ${
            esNegativo ? "text-red-400" : "text-green-400"
          }`}
        >
          ${Math.abs(valor).toLocaleString("es-AR")}
        </span>
      );
    },
  },
];
