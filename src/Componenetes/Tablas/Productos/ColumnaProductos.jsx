export const columnasProductos = [
  {
    key: "nombre",
    etiqueta: "Producto",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div>
        <div className="font-medium">{valor}</div>
        <div className="text-xs text-gray-100/50">
          {fila.sabor} • {fila.pesoUnitario * 1000}g
        </div>
      </div>
    ),
  },
  {
    key: "stock",
    etiqueta: "Stock",
    filtrable: false,
    renderizar: (valor, fila) => (
      <div>
        <span
          className={`font-semibold ${
            valor > 50
              ? "text-green-400"
              : valor > 20
              ? "text-yellow-400"
              : "text-red-400"
          }`}
        >
          {valor} {fila.unidad}
        </span>
        <div className="text-xs text-gray-100/50">
          {fila.paquetes} paquetes × {fila.cantidadPorPaquete}
        </div>
      </div>
    ),
  },
  {
    key: "pesoTotal",
    etiqueta: "Peso Total",
    filtrable: false,
    renderizar: (valor) => <span className="text-sm">{valor} kg</span>,
  },
  {
    key: "precioUnitario",
    etiqueta: "Precio Unit.",
    filtrable: false,
    renderizar: (valor) => <span className="text-sm">${valor.toFixed(2)}</span>,
  },
  {
    key: "precioTotal",
    etiqueta: "Valor Total",
    filtrable: false,
    renderizar: (valor) => (
      <span className="font-semibold text-green-400">
        ${valor.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
      </span>
    ),
  },
];
