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
    filtrable: true,
    renderizar: (valor) => {
      const esAlumno = valor === "ALUMNO";

      return (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold
            ${
              esAlumno
                ? "bg-blue-500/20 text-blue-300"
                : "bg-green-500/20 text-green-300"
            }`}
        >
          {esAlumno ? "Alumno" : "Comprador"}
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
