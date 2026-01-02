export const columnasLibroMayor = [
  {
    key: "fecha",
    etiqueta: "Fecha",
  },
  {
    key: "descripcion",
    etiqueta: "Descripción",
  },
  {
    key: "debe",
    etiqueta: "Debe",
    renderizar: (v) => (v > 0 ? `$${v.toFixed(2)}` : "—"),
  },
  {
    key: "haber",
    etiqueta: "Haber",
    renderizar: (v) => (v > 0 ? `$${v.toFixed(2)}` : "—"),
  },
  {
    key: "saldo",
    etiqueta: "Saldo",
    renderizar: (v) => (
      <span
        className={`font-semibold ${
          v >= 0 ? "text-green-400" : "text-red-400"
        }`}
      >
        ${v.toFixed(2)}
      </span>
    ),
  },
];
