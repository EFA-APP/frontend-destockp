export const columnasProveedores = [
  {
    key: "razonSocial",
    etiqueta: "Razón Social",
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
    key: "cuit",
    etiqueta: "C.U.I.T",
    filtrable: true,
    renderizar: (valor) => <span className="font-mono text-sm">{valor}</span>,
  },
  {
    key: "telefono",
    etiqueta: "Teléfono",
    filtrable: false,
  },
];
