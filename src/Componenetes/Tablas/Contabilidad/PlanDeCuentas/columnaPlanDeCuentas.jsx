const tipoColor = {
  ACTIVO: "bg-blue-500/20 text-blue-400 border-blue-400/30",
  PASIVO: "bg-teal-500/20 text-teal-400 border-teal-400/30",
  RESULTADO: "bg-green-500/20 text-green-400 border-green-400/30",
  PATRIMONIO: "bg-purple-500/20 text-purple-400 border-purple-400/30",
};

export const columnasPlanDeCuentas = [
  {
    key: "codigo",
    etiqueta: "Código",
    renderizar: (valor, fila) => <span className="font-mono">{valor}</span>,
  },
  {
    key: "nombre",
    etiqueta: "Cuenta",
    renderizar: (valor, fila) => (
      <div>
        <div className="font-medium text-xs">{valor}</div>
        {fila.subtipo && (
          <div className="text-xs text-gray-400">{fila.subtipo}</div>
        )}
      </div>
    ),
  },
  {
    key: "tipo",
    etiqueta: "Tipo",
    renderizar: (valor) => (
      <span
        className={`font-semibold text-xs p-1 rounded-full border ${tipoColor[valor]}`}
      >
        {valor}
      </span>
    ),
  },
  {
    key: "imputable",
    etiqueta: "Imputable",
    renderizar: (valor) => (valor ? "✔ Sí" : "—"),
  },
  {
    key: "activa",
    etiqueta: "Estado",
    renderizar: (valor) => (valor ? "Activa" : "Inactiva"),
  },
];
