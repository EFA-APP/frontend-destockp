// columnasLibroDiario.js

const origenColor = {
  VENTA: "bg-blue-500/20 text-blue-400 border-blue-400/30",
  COMPRA: "bg-teal-500/20 text-teal-400 border-teal-400/30",
  MANUAL: "bg-green-500/20 text-green-400 border-green-400/30",
};

export const columnasLibroDiario = [
  {
    key: "fecha",
    etiqueta: "Fecha",
    renderizar: (valor) => (
      <span className="text-xs">
        {new Date(valor + "T00:00:00").toLocaleDateString("es-AR")}
      </span>
    ),
  },
  {
    key: "id",
    etiqueta: "Asiento",
    renderizar: (valor) => (
      <span className="font-semibold text-[var(--primary)] text-xs">
        #{valor}
      </span>
    ),
  },
  {
    key: "descripcion",
    etiqueta: "Descripción",
    renderizar: (valor, fila) => (
      <div>
        <div className="font-medium text-xs">{valor}</div>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`px-2 py-0.5 text-xs font-semibold border rounded-full ${
              origenColor[fila.origen]
            }`}
          >
            {fila.origen}
          </span>
          <span className="text-xs text-[var(--primary-light)]">Ref: {fila.referencia}</span>
        </div>
      </div>
    ),
  },
];
