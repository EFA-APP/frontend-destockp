import React from "react";

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
      const ptoVta = String(fila.puntoVenta || 1).padStart(4, "0");
      const nro = String(valor || 0).padStart(8, "0");

      // Identificación amigable del tipo
      const tipo = Number(fila.tipoDocumento);
      const esNC = [3, 8, 13, 53].includes(tipo);
      const esND = [2, 7, 12, 52].includes(tipo);
      const esRecibo = [4, 9, 15, 54].includes(tipo);

      let label = "Factura";
      let badgeStyle =
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

      if (esNC) {
        label = "Nota Crédito";
        badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/20";
      } else if (esND) {
        label = "Nota Débito";
        badgeStyle = "bg-amber-500/10 text-amber-500 border-amber-500/20";
      } else if (esRecibo) {
        label = "Recibo";
        badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/20";
      }

      return (
        <div className="py-2 group/cell">
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md whitespace-nowrap ${badgeStyle}`}
            >
              {label} {fila.letraComprobante || ""}
            </div>

            {/* BADGES DE ESTADO (ANULACIÓN/AJUSTE) */}
            {fila.estado === "ANULADO" ? (
              <div className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md whitespace-nowrap bg-red-500/10 text-red-500 border-red-500/30">
                ANULADO
              </div>
            ) : fila.estado === "AJUSTADO_PARCIAL" ? (
              <div className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md whitespace-nowrap bg-amber-500/10 text-amber-500 border-amber-500/30">
                PARCIAL
              </div>
            ) : (
              <div
                title={
                  fila.fiscal
                    ? "Comprobante Fiscal (AFIP)"
                    : "Comprobante Interno"
                }
                className={`w-1.5 h-1.5 rounded-full ${
                  fila.fiscal ? "bg-emerald-500" : "bg-blue-400"
                }`}
              ></div>
            )}
          </div>
          <div className="font-black text-white tracking-tighter text-sm group-hover/cell:text-[var(--primary)] transition-colors">
            {`${ptoVta}-${nro}`}
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
        <span className="text-[10px] text-[var(--primary-light)] font-medium uppercase mt-1">
          {new Date(valor).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    ),
  },
  {
    key: "receptor",
    etiqueta: "Cliente / Receptor",
    filtrable: true,
    renderizar: (valor) => {
      const idIva = Number(valor?.CondicionIVAReceptorId);
      
      const configIva = {
        1: { label: "RI", style: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
        4: { label: "Monot.", style: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
        5: { label: "CF", style: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
        6: { label: "Exento", style: "bg-amber-500/10 text-amber-500 border-amber-500/20" }
      };

      const iva = configIva[idIva] || { label: "S/D", style: "bg-zinc-800 text-zinc-500 border-zinc-700" };

      return (
        <div className="flex flex-col py-1 group/receptor">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-black text-white uppercase tracking-tight italic group-hover/receptor:text-[var(--primary)] transition-colors">
              {valor?.razonSocial || "CONSUMIDOR FINAL"}
            </span>
            <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 border rounded-sm ${iva.style}`}>
              {iva.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 opacity-40">
            <span className="text-[10px] font-bold">
              {valor?.DocTipo === 80 ? "CUIT" : "DNI"}
            </span>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <span className="text-[10px] font-medium tracking-wider">
              {valor?.DocNro || "0"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    key: "total",
    etiqueta: "Total Bruto",
    renderizar: (valor) => (
      <div className="flex flex-col items-end px-4">
        <span className="font-black text-blue-400 text-sm tracking-tighter">
          ${Number(valor).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </span>
        <div className="w-8 h-0.5 bg-blue-500/20 rounded-full mt-0.5" />
      </div>
    ),
  },
  {
    key: "saldo",
    etiqueta: "Saldo Pendiente",
    renderizar: (_, fila) => {
      // Usamos el campo estructural de la DB si existe, si no, calculamos (fallback temporal)
      const pagado = fila.pagos?.reduce((acc, p) => acc + (p.monto || 0), 0) || 0;
      const saldoCalculado = (fila.total || 0) - pagado;
      
      const saldo = fila.saldoPendiente !== undefined 
        ? Number(fila.saldoPendiente) 
        : saldoCalculado;

      const esCtaCte =
        fila.condicionVenta?.toLowerCase() === "cuenta_corriente";

      if (!esCtaCte && saldo <= 0)
        return (
          <div className="flex flex-col items-end px-4 opacity-20">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
              Contado
            </span>
          </div>
        );

      return (
        <div className="flex flex-col items-end px-4">
          {saldo > 0.01 ? (
            <span className="font-black text-amber-500 text-sm tracking-tighter">
              ${saldo.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                Saldado
              </span>
            </div>
          )}
        </div>
      );
    },
  },
];
