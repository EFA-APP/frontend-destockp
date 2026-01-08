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
    renderizar: (valor, fila) => (
      <span
        className={`font-mono text-xs ${
          !fila.imputable ? "font-bold text-white" : ""
        }`}
      >
        {valor}
      </span>
    ),
  },
  {
    key: "nombre",
    etiqueta: "Cuenta",
    renderizar: (valor, fila) => (
      <div>
        {/* Nombre */}
        <div
          className={`text-xs ${
            fila.imputable ? "font-medium" : "font-semibold uppercase"
          }`}
        >
          {valor}
        </div>

        {/* Subtipo */}
        {fila.subtipo && (
          <div className="text-xs text-[var(--primary-light)]">
            {fila.subtipo}
          </div>
        )}

        {/* Helper visual opcional */}
        {!fila.imputable && (
          <div className="text-xs text-[var(--primary-light)]">
            Cuenta agrupadora
          </div>
        )}
      </div>
    ),
  },
  {
    key: "tipo",
    etiqueta: "Tipo",
    renderizar: (valor) => (
      <span
        className={`font-semibold text-xs px-2 py-[2px] rounded-full border ${tipoColor[valor]}`}
      >
        {valor}
      </span>
    ),
  },
  {
    key: "imputable",
    etiqueta: "Imputable",
    renderizar: (valor) => (
      <span
        className={`text-xs font-medium ${
          valor ? "text-green-400" : "text-[var(--primary-light)]"
        }`}
      >
        {valor ? "✔ Sí" : "—"}
      </span>
    ),
  },
  {
    key: "activa",
    etiqueta: "Estado",
    renderizar: (valor) => (
      <span
        className={`text-xs font-medium ${
          valor ? "text-green-400" : "text-red-400"
        }`}
      >
        {valor ? "Activa" : "Inactiva"}
      </span>
    ),
  },
];
