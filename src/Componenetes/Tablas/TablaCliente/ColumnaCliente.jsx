export const columnasClientes = [
  {
    key: "codigo",
    etiqueta: "Código",
    filtrable: true,
    renderizar: (valor) => <span className="font-mono text-sm">{valor}</span>,
  },
  {
    key: "nombre",
    etiqueta: "Cliente",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div>
        <div>{valor}</div>
        <div className="text-xs text-gray-100/50">
          {fila.tipo === "ALUMNO"
            ? `Alumno • ${fila.curso || "Sin curso"}`
            : `Venta • ${fila.condicionIVA || "CF"}`}
        </div>
      </div>
    ),
  },
  {
    key: "documento",
    etiqueta: "Documento",
    filtrable: true,
    renderizar: (valor) => <span className="font-mono text-sm">{valor}</span>,
  },
  {
    key: "telefono",
    etiqueta: "Teléfono",
    filtrable: false,
  },
];
