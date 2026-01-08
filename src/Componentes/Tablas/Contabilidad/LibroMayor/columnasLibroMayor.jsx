export const columnasLibroMayor = [
  {
    key: "cuenta",
    etiqueta: "Cuenta",
    renderizar: (valor, fila) => (
      <div>
        <div className="font-mono text-xs text-white">{valor}</div>
        <div className="text-xs text-[var(--primary-light)]">
          {fila.nombreCuenta}
        </div>
      </div>
    ),
  },
  {
    key: "totalDebe",
    etiqueta: "Debe",
    renderizar: (valor) => (
      <span className="text-xs text-blue-400">${valor.toFixed(2)}</span>
    ),
  },
  {
    key: "totalHaber",
    etiqueta: "Haber",
    renderizar: (valor) => (
      <span className="text-xs text-red-400">${valor.toFixed(2)}</span>
    ),
  },
  {
    key: "saldo",
    etiqueta: "Saldo",
    renderizar: (valor) => (
      <span
        className={`text-xs font-semibold ${
          valor >= 0 ? "text-green-400" : "text-red-400"
        }`}
      >
        ${valor.toFixed(2)}
      </span>
    ),
  },
];
