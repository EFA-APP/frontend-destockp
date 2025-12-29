const tipoClienteStyles = {
  comprador: "bg-blue-500/20 text-blue-400 border-blue-400/30",
  alumno: "bg-teal-500/20 text-teal-400 border-teal-400/30",
  otros: "bg-gray-500/20 text-gray-400 border-gray-400/30",
};

export const columnasClientes = [
  {
    key: "nombre",
    etiqueta: "Cliente",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div>
        <div>{valor}</div>
        <div className="text-xs text-gray-100/50">
          {fila.tipo === "ALUMNO"
            ? `Curso: ${fila.curso || "Sin curso"}`
            : `C. IVA: ${fila.condicionIVA || "CF"}`}
        </div>
      </div>
    ),
  },
  {
    key: "tipo",
    etiqueta: "Tipo",
    filtrable: false,
    renderizar: (valor) => {
      const tipo = valor.toLowerCase();
      const style =
        tipoClienteStyles[tipo] ||
        "bg-gray-500/20 text-gray-400 border-gray-400/30";

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
