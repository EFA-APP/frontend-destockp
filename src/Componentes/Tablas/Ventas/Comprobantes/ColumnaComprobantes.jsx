import React from 'react';

const estadoStyle = {
  pagada: "bg-green-500/20 text-green-400 border-green-400/30",
  pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
  vencida: "bg-red-500/20 text-red-400 border-red-400/30",
};

export const columnasComprobantes = [
  {
    key: "numeroComprobante",
    etiqueta: "Identificación Comprobante",
    renderizar: (valor, fila) => {
      const ptoVta = String(fila.puntoVenta || 1).padStart(4, '0');
      const nro = String(valor || 0).padStart(8, '0');

      return (
        <div className="py-2 group/cell">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1.5 py-0.5 border border-white/5 bg-white/[0.02] rounded">
              Letra {fila.letraComprobante || 'X'}
            </div>
            <div
              title={fila.fiscal ? "Comprobante Fiscal (AFIP)" : "Comprobante Interno"}
              className={`w-2 h-2 rounded-full shadow-sm animate-pulse ${fila.fiscal
                  ? "bg-emerald-500 shadow-emerald-500/50"
                  : "bg-blue-500 shadow-blue-500/50"
                }`}
            ></div>
          </div>
          <div className="font-black text-white tracking-tighter text-sm group-hover/cell:text-[var(--primary)] transition-colors">
            {`${ptoVta}-${nro}`}
          </div>
          <div className="text-[9px] uppercase font-bold text-white/30 tracking-tight mt-0.5">
            {fila.tipoDocumento === 1 ? 'Factura A' : fila.tipoDocumento === 6 ? 'Factura B' : 'Ticket Interno'}
          </div>
        </div>
      );
    },
  },
  {
    key: "fechaEmision",
    etiqueta: "Fecha Emisión",
    renderizar: (valor) => (
      <div className="flex flex-col">
        <span className="text-[13px] font-bold text-white/80">
          {new Date(valor).toLocaleDateString("es-AR")}
        </span>
        <span className="text-[10px] text-white/20 font-medium uppercase">
          {new Date(valor).toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    ),
  },
  {
    key: "receptor",
    etiqueta: "Cliente / Receptor",
    filtrable: true,
    renderizar: (valor) => (
      <div className="flex flex-col py-1">
        <span className="text-sm font-black text-white uppercase tracking-tight italic">
          {valor?.razonSocial || "CONSUMIDOR FINAL"}
        </span>
        <div className="flex items-center gap-1.5 opacity-40">
          <span className="text-[10px] font-bold">
            {valor?.DocTipo === 80 ? 'CUIT' : 'DNI'}
          </span>
          <div className="w-1 h-1 rounded-full bg-white" />
          <span className="text-[10px] font-medium tracking-wider">
            {valor?.DocNro || "0"}
          </span>
        </div>
      </div>
    ),
  },
  {
    key: "total",
    etiqueta: "Total Bruto",
    renderizar: (valor) => (
      <div className="flex flex-col items-end px-4">
        <span className="font-black text-emerald-400 text-lg tracking-tighter">
          ${Number(valor).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </span>
        <div className="w-8 h-0.5 bg-emerald-500/20 rounded-full mt-0.5" />
      </div>
    ),
  },
];
