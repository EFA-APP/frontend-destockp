export const columnasMateriaPrima = [
  {
    key: "codigo",
    etiqueta: "Código",
    filtrable: true,
    renderizar: (valor) => <span className="font-mono text-sm">{valor}</span>,
  },
  {
    key: "nombre",
    etiqueta: "Materia Prima",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div>
        <div className="font-medium">{valor}</div>
        <div className="text-xs text-gray-100/50">{fila.descripcion}</div>
      </div>
    ),
  },
  {
    key: "stock",
    etiqueta: "Stock Total",
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
          {fila.paquetes} paquetes x {fila.cantidadPorPaquete} {fila.unidad}
        </div>
      </div>
    ),
  },
  {
    key: "precioUnitario",
    etiqueta: "Precio Unitario",
    filtrable: false,
    renderizar: (valor, fila) => (
      <span className="text-sm">
        ${valor.toFixed(2)} / {fila.unidad}
      </span>
    ),
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
