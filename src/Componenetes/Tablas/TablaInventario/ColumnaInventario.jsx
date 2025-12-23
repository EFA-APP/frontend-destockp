export const columnasInventario = [
  {
    key: "codigo",
    etiqueta: "Código",
    filtrable: true,
    renderizar: (valor) => <span className="font-mono text-sm">{valor}</span>,
  },
  {
    key: "nombre",
    etiqueta: "Producto",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div>
        <div>{valor}</div>
        <div className="text-xs text-gray-100/50">{fila.categoria}</div>
      </div>
    ),
  },
  {
    key: "stock",
    etiqueta: "Stock",
    filtrable: false,
    renderizar: (valor) => (
      <span
        className={`${
          valor > 10
            ? "text-green-400"
            : valor > 0
            ? "text-yellow-400"
            : "text-red-400"
        }`}
      >
        {valor} unidades
      </span>
    ),
  },
  {
    key: "precio",
    etiqueta: "Precio",
    filtrable: false,
    renderizar: (valor) => <span>${valor.toFixed(2)}</span>,
  },
];
