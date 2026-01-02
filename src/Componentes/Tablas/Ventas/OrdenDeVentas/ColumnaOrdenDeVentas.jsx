const estadoOrdenStyle = {
  pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
  confirmada: "bg-blue-500/20 text-blue-400 border-blue-400/30",
  facturada: "bg-green-500/20 text-green-400 border-green-400/30",
  cancelada: "bg-red-500/20 text-red-400 border-red-400/30",
};

export const columnasOrdenesVenta = [
  {
    key: "numeroOrden",
    etiqueta: "Orden",
    renderizar: (valor) => <span className="font-medium">{valor}</span>,
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
        estadoOrdenStyle[estado] ||
        "bg-gray-500/20 text-gray-400 border-gray-400/30";

      return (
        <span
          className={`
            inline-flex items-center 
            text-xs font-medium border
            py-0.5 px-1.5 rounded-md
          ${style}`}
        >
          {valor?.toUpperCase() || "-"}
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
