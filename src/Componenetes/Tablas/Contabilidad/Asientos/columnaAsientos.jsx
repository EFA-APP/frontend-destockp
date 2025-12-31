const tipoColor = {
  VENTA: "bg-blue-500/20 text-blue-400 border-blue-400/30",
  COMPRA: "bg-teal-500/20 text-teal-400 border-teal-400/30",
  MANUAL: "bg-green-500/20 text-green-400 border-green-400/30",
};

export const columnasAsientos = [
  {
    key: "fecha",
    etiqueta: "Fecha",
  },
  {
    key: "descripcion",
    etiqueta: "Descripción",
  },
  {
    key: "origen",
    etiqueta: "Origen",
    renderizar: (valor) => (
      <span
        className={`text-xs border rounded-full p-1 font-semibold ${tipoColor[valor]}`}
      >
        {valor}
      </span>
    ),
  },
  {
    key: "totalDebe",
    etiqueta: "Debe",
    renderizar: (valor) => `$${valor.toFixed(2)}`,
  },
  {
    key: "totalHaber",
    etiqueta: "Haber",
    renderizar: (valor) => `$${valor.toFixed(2)}`,
  },
];
