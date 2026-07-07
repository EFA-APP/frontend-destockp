const Highlight = ({ text, term }) => {
  if (!term || !text) return text;
  const parts = String(text).split(new RegExp(`(${term})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-400/40 text-[var(--primary)] px-0.5 rounded font-black italic"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
};

export const columnasComprobantes = [
  {
    key: "numeroComprobante",
    etiqueta: "Comprobante",
    renderizar: (valor, fila, busqueda) => {
      const ptoVta = String(fila.puntoVenta || 1).padStart(4, "0");
      const nro = String(valor || 0).padStart(8, "0");
      const textoCompleto = `${ptoVta}-${nro}`;

      // Identificación amigable del tipo
      const tipo = Number(fila.tipoDocumento);
      const esNC = [3, 8, 13, 53, 994].includes(tipo);
      const esND = [2, 7, 12, 52, 995].includes(tipo);
      const esRecibo = [4, 9, 15, 54, 992].includes(tipo);
      const esOP = [993].includes(tipo);

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
        label = "Recibo";
        badgeStyle = "bg-blue-700/10 text-blue-400 border-blue-700/20";
      } else if (esOP) {
        label = "Orden de Pago";
        badgeStyle = "bg-cyan-700/10 text-cyan-400 border-cyan-700/20";
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
                  title={
                    fila.fiscal
                      ? "Comprobante Fiscal (AFIP)"
                      : "Comprobante Interno"
                  }
                  className={`w-1.5 h-1.5 rounded-full ${
                    fila.fiscal ? "bg-emerald-700" : "bg-blue-400"
                  }`}
                ></div>
              );
            })()}
          </div>
          <div className="font-black text-black tracking-tighter text-sm group-hover/cell:text-[var(--primary)] ">
            <Highlight text={textoCompleto} term={busqueda} />
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
        <span className="text-[15px] font-bold text-black/80">
          {new Date(valor).toLocaleDateString("es-AR")}
        </span>
        <span className="text-[12px] text-[var(--primary)]/70 font-medium uppercase mt-1">
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
    etiqueta: "contacto",
    filtrable: true,
    renderizar: (valor, fila, busqueda) => {
      const idIva = Number(valor?.CondicionIVAReceptorId);

      const configIva = {
        1: {
          label: "RI",
          style: "bg-blue-700/10 text-blue-400 border-blue-700/20",
        },
        4: {
          label: "Monot.",
          style: "bg-purple-700/10 text-purple-400 border-purple-700/20",
        },
        5: {
          label: "CF",
          style:
            "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]",
        },
        6: {
          label: "Exento",
          style: "bg-amber-700/10 text-amber-700 border-amber-700/20",
        },
      };

      const iva = configIva[idIva] || {
        label: "S/D",
        style:
          "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]",
      };

      return (
        <div className="flex flex-col py-1 group/receptor">
          <div className="mb-1">
            <span className="text-sm font-black text-black uppercase tracking-tight italic group-hover/receptor:text-[var(--primary)] ">
              <Highlight
                text={valor?.razonSocial || "CONSUMIDOR FINAL"}
                term={busqueda}
              />
            </span>
          </div>

          {/* INDICADOR DE COINCIDENCIA EN ITEMS */}
          {busqueda &&
            fila.detalles?.some((d) =>
              d.nombre?.toLowerCase().includes(busqueda.toLowerCase()),
            ) && (
              <div className="flex items-center gap-1 mb-1 animate-pulse">
                <div className="w-1 h-3 bg-[var(--primary)] rounded-full" />
                <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">
                  Item:{" "}
                  <Highlight
                    text={
                      fila.detalles.find((d) =>
                        d.nombre
                          ?.toLowerCase()
                          .includes(busqueda.toLowerCase()),
                      )?.nombre
                    }
                    term={busqueda}
                  />
                </span>
              </div>
            )}
          {/* Si existe DocTipo y DocNro se muestra el, evitar que quede DNI: 0, y CUIT: 0, ose directamente no renderizar nada   */}
          {valor?.DocTipo &&
            valor?.DocNro &&
            String(valor.DocNro).trim() !== "0" &&
            String(valor.DocNro).trim() !== "" && (
              <div className="w.full">
                <div className="flex justify-end">
                  <span className="text-[12px] font-bold">
                    {valor?.DocTipo === 80 ? "CUIT:" : "DNI:"}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-white/30" />
                  <span className="text-[12px] font-medium tracking-wider">
                    <Highlight text={valor?.DocNro || ""} term={busqueda} />
                  </span>
                </div>
              </div>
            )}
        </div>
      );
    },
  },
  {
    key: "total",
    etiqueta: "Total Bruto",
    renderizar: (valor) => (
      <div className="flex flex-col  md:items-end px-4">
        <span className="font-black text-blue-400 text-sm tracking-tighter">
          ${Number(valor).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </span>
      </div>
    ),
  },
  {
    key: "saldo",
    etiqueta: "Saldo Pendiente",
    renderizar: (_, fila) => {
      // Usamos el campo estructural de la DB si existe, si no, calculamos (fallback temporal)
      const pagado =
        fila.pagos?.reduce((acc, p) => acc + (p.monto || 0), 0) || 0;
      const saldoCalculado = (fila.total || 0) - pagado;

      const saldo =
        fila.saldoPendiente !== undefined
          ? Number(fila.saldoPendiente)
          : saldoCalculado;

      const esCtaCte =
        fila.condicionVenta?.toLowerCase() === "cuenta_corriente";

      if (!esCtaCte && saldo <= 0)
        return (
          <div className="flex flex-col items-end px-4">
            <span className="text-[12px] font-black uppercase tracking-widest text-[var(-primary)]">
              Contado
            </span>
          </div>
        );

      return (
        <div className="flex flex-col items-end px-4">
          {saldo > 0.01 ? (
            <span className="font-black text-amber-700 text-sm tracking-tighter">
              ${saldo.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
          ) : (
            <div className="bg-emerald-700/10 border border-emerald-700/20 px-1.5 py-0.5 rounded">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                Saldado
              </span>
            </div>
          )}
        </div>
      );
    },
  },
];
