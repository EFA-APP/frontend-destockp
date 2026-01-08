const tipoColor = {
  VENTA: "bg-blue-500/20 text-blue-400 border-blue-400/30",
  COMPRA: "bg-teal-500/20 text-teal-400 border-teal-400/30",
  MANUAL: "bg-green-500/20 text-green-400 border-green-400/30",
};
export const columnasAsientos = [
  {
    key: "fecha",
    etiqueta: "Fecha",
    renderizar: (valor, fila) => (
      <div className="text-xs flex flex-col gap-1">
        <span>{valor}</span>
        <span
          className={`w-[60px] text-[10px] border rounded-full px-2 font-semibold ${
            tipoColor[fila.origen]
          }`}
        >
          <p className="w-auto text-center">{fila.origen}</p>
        </span>
      </div>
    ),
  },
  {
    key: "descripcion",
    etiqueta: "Descripción",
  },
  {
    key: "totalDebe",
    etiqueta: "Debe",
    renderizar: (valor) => `$${valor.toFixed(2)}`,
  },
  {
    key: "totalHaber",
    etiqueta: "Haber",
    renderizar: (valor) => `$${valor.toFixed(2)}`,
  },
];
