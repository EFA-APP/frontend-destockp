export const columnasFacturasProveedor = [
  {
    key: "numeroComprobante",
    etiqueta: "Comprobante",
    renderizar: (valor, fila) => {
      const ptoVta = String(fila.puntoVenta || 1).padStart(5, "0");
      const nro = String(valor || 0).padStart(8, "0");

      // Identificación amigable del tipo
      const tipo = Number(fila.tipoDocumento);
      const esNC = [3, 8, 13, 53, 993].includes(tipo);
      const esND = [2, 7, 12, 52, 994].includes(tipo);
      const esRecibo = [4, 9, 15, 54, 992].includes(tipo);

      let label = "Factura";
      let badgeStyle =
        "bg-emerald-700/10 text-emerald-400 border-emerald-700/20";

      if (esNC) {
        label = "Nota Crédito";
        badgeStyle = "bg-rose-700/10 text-rose-400 border-rose-700/20";
      } else if (esND) {
        label = "Nota Débito";
        badgeStyle = "bg-amber-700/10 text-amber-700 border-amber-700/20";
      } else if (esRecibo) {
        label = "Pago Prov.";
        badgeStyle = "bg-blue-700/10 text-blue-400 border-blue-700/20";
      }

      return (
        <div className="py-2 group/cell">
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md whitespace-nowrap ${badgeStyle}`}
            >
              {label} {fila.letraComprobante || ""}
            </div>

            {/* BADGES DE ESTADO (ANULACIÓN/AJUSTE/PAGO) */}
            {(() => {
              const config = {
                VALIDO: {
                  label: "VALIDO",
                  style:
                    "bg-emerald-700/10 text-emerald-700 border-emerald-700/30",
                },
                ANULADO: {
                  label: "ANULADO",
                  style: "bg-red-700/10 text-red-700 border-red-700/30",
                },
                ABONADO: {
                  label: "ABONADO",
                  style:
                    "bg-emerald-700/10 text-emerald-700 border-emerald-700/30",
                },
                PARCIALMENTE_ABONADO: {
                  label: "PARCIAL",
                  style: "bg-amber-700/10 text-amber-700 border-amber-700/30",
                },
                AJUSTADO_PARCIAL: {
                  label: "PARCIAL",
                  style: "bg-amber-700/10 text-amber-700 border-amber-700/30",
                },
                PARCIALMENTE_ANULADO: {
                  label: "ANUL. PARCIAL",
                  style: "bg-rose-700/10 text-rose-700 border-rose-700/30",
                },
                PENDIENTE_PAGO: {
                  label: "PENDIENTE",
                  style:
                    "bg-yellow-700/10 text-yellow-700 border-yellow-700/30",
                },
              };

              const estado = config[fila.estado];

              if (estado) {
                return (
                  <div
                    className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md whitespace-nowrap ${estado.style}`}
                  >
                    {estado.label}
                  </div>
                );
              }

              return (
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    fila.fiscal ? "bg-emerald-700" : "bg-blue-400"
                  }`}
                ></div>
              );
            })()}
          </div>
          <div className="font-black text-black tracking-tighter text-sm group-hover/cell:text-[var(--primary)] ">
            {`${ptoVta}-${nro}`}
          </div>
        </div>
      );
    },
  },
  {
    key: "fechaEmision",
    etiqueta: "Fecha",
    renderizar: (valor) => (
      <div className="flex flex-col">
        <span className="text-[15px] font-bold text-black/80">
          {new Date(valor).toLocaleDateString("es-AR")}
        </span>
      </div>
    ),
  },
  {
    key: "receptor",
    etiqueta: "Proveedor",
    renderizar: (valor) => {
      return (
        <div className="flex flex-col py-1 group/receptor">
          <span className="text-sm font-black text-black uppercase tracking-tight italic group-hover/receptor:text-[var(--primary)] ">
            {valor?.razonSocial || "PROVEEDOR S/D"}
          </span>
          {valor?.DocTipo &&
            valor?.DocNro &&
            String(valor.DocNro).trim() !== "0" &&
            String(valor.DocNro).trim() !== "" && (
              <span className="text-[10px] font-bold  uppercase">
                {valor?.DocNro ? `CUIT: ${valor.DocNro}` : ""}
              </span>
            )}
        </div>
      );
    },
  },
  {
    key: "total",
    etiqueta: "Total",
    renderizar: (valor) => (
      <span className="font-black text-blue-400 text-sm tracking-tighter">
        ${Number(valor).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    key: "saldoPendiente",
    etiqueta: "Saldo",
    renderizar: (valor, fila) => {
      const saldo = Number(valor || 0);
      if (saldo <= 0.01) {
        return (
          <div className="border border-emerald-700/20 px-1.5 py-0.5 rounded w-full">
            <span className="text-[10px] font-black text-emerald-400 uppercase ">
              Saldado
            </span>
          </div>
        );
      }
      return (
        <span className="font-black text-amber-700 text-sm tracking-tighter">
          ${saldo.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </span>
      );
    },
  },
];
