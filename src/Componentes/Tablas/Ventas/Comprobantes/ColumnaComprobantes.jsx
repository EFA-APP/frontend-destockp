import React from 'react';

const estadoStyle = {
  pagada: "bg-green-500/20 text-green-400 border-green-400/30",
  pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
  vencida: "bg-red-500/20 text-red-400 border-red-400/30",
};

export const columnasComprobantes = [
  {
    key: "numeroComprobante",
    etiqueta: "Comprobante",
    renderizar: (valor, fila) => {
      const ptoVta = String(fila.puntoVenta || 1).padStart(4, '0');
      const nro = String(valor || 0).padStart(8, '0');
      
      return (
        <div>
          <div className="font-medium text-gray-100">{`${ptoVta}-${nro}`}</div>
          <div className="flex justify-start items-center gap-2">
            <div className="text-[10px] uppercase font-bold text-gray-400">
              {fila.tipoDocumento === 1 ? 'Factura A' : fila.tipoDocumento === 6 ? 'Factura B' : `Tipo ${fila.letraComprobante || 'X'}`}
            </div>
            <div
              title={fila.fiscal ? "Comprobante Fiscal (AFIP)" : "Comprobante Interno"}
              className={`w-2 h-2 rounded-full shadow-sm ${
                fila.fiscal
                  ? "bg-green-400 shadow-green-400/50"
                  : "bg-blue-400 shadow-blue-400/50"
              }`}
            ></div>
          </div>
        </div>
      );
    },
  },
  {
    key: "fechaEmision",
    etiqueta: "Fecha",
    renderizar: (valor) => (
      <span className="text-sm text-gray-300">
        {new Date(valor).toLocaleDateString("es-AR")}
      </span>
    ),
  },
  {
    key: "receptor",
    etiqueta: "Receptor / Cliente",
    filtrable: true,
    renderizar: (valor, fila) => (
      <div className="flex flex-col">
        <span className="font-medium text-gray-100 italic">
            {valor?.razonSocial || "CONSUMIDOR FINAL"}
        </span>
        <span className="text-[10px] text-gray-500">
            {valor?.DocNro ? `${valor.DocTipo === 80 ? 'CUIT' : 'DOC'}: ${valor.DocNro}` : "Sin Identificar"}
        </span>
      </div>
    ),
  },
  {
    key: "metodoPago",
    etiqueta: "Pago",
    renderizar: (valor) => (
      <span className="text-xs uppercase font-semibold text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded border border-gray-700">
        {valor || "EFECTIVO"}
      </span>
    ),
  },
  {
    key: "total",
    etiqueta: "Total",
    renderizar: (valor) => (
      <span className="font-bold text-green-400 text-base">
        ${Number(valor).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
      </span>
    ),
  },
];
