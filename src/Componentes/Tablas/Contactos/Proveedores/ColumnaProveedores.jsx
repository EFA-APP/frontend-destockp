const rubroStyles = {
  alimentos: "bg-green-500/20! text-green-400! border-green-400/30!",
  insumos: "bg-blue-500/20 text-blue-400 border-blue-400/30",
  materias_primas: "bg-orange-500/20 text-orange-400 border-orange-400/30",
  limpieza: "bg-cyan-500/20 text-cyan-400 border-cyan-400/30",
  embalaje: "bg-purple-500/20 text-purple-400 border-purple-400/30",
  logistica: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
  tecnologia: "bg-indigo-500/20 text-indigo-400 border-indigo-400/30",
  servicios: "bg-pink-500/20 text-pink-400 border-pink-400/30",
  mantenimiento: "bg-red-500/20 text-red-400 border-red-400/30",
  equipamiento: "bg-teal-500/20 text-teal-400 border-teal-400/30",
  construccion: "bg-amber-500/20 text-amber-400 border-amber-400/30",
  otros: "bg-gray-500/20 text-gray-400 border-gray-400/30",
};

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
  {
    key: "rubro",
    etiqueta: "Rubro",
    filtrable: false,
    renderizar: (valor) => {
      const style =
        rubroStyles[valor] || "bg-gray-500/20 text-gray-400 border-gray-400/30";

      return (
        <span
          className={`
          inline-flex items-center px-2 py-0.5
          text-xs font-medium rounded-full
          border ${style}
        `}
        >
          {valor ? valor.replace("_", " ").toUpperCase() : "SIN RUBRO"}
        </span>
      );
    },
  },
];
