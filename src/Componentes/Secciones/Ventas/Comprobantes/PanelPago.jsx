import {
  ComprobanteIcono,
  ArcaIcono,
  CheckIcono,
  DineroIcono,
  CuentaIcono,
  BorrarIcono,
  TarjetaIcono,
  VentasIcono,
} from "../../../../assets/Icons";

const PanelPago = ({
  tabActiva,
  enBlanco,
  setEnBlanco,
  tipoDocumento,
  setTipoDocumento,
  aplicaIva,
  setAplicaIva,
  metodoPago,
  setMetodoPago,
  busquedaCliente,
  setBusquedaCliente,
  clienteSeleccionado,
  setClienteSeleccionado,
  mostrarDropdownCliente,
  setMostrarDropdownCliente,
  clientes,
  condicionVenta,
  setCondicionVenta,
  busquedaFactura,
  setBusquedaFactura,
  comprobanteAsociado,
  setComprobanteAsociado,
  mostrarDropdownFactura,
  setMostrarDropdownFactura,
  facturas,
  totales,
  handleFacturar,
  items,
  tiposComprobante = [],
  usuario = {},
}) => {
  const isArca = usuario?.conexionArca || usuario?.configuracionArca?.activo;
  const esTipoA = [1, 2, 3, 4, 5].includes(Number(tipoDocumento));

  return (
    <div
      className={`w-full md:w-[380px] shrink-0 bg-[#0a0a0a] border-l border-[var(--border-subtle)] flex flex-col shadow-[-10px_0_20px_max(rgba(0,0,0,0.2))] z-20 ${tabActiva !== "pago" ? "hidden md:flex" : "flex"}`}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-3 md:pb-1 flex flex-col gap-4">
        {/* 1. CONFIG FISCAL RAPIDA (Solo si es ARCA) */}
        {isArca && (
          <div className="bg-[var(--surface)] p-4 rounded-md border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center gap-2 mb-2 text-[var(--text-muted)]">
              <ComprobanteIcono size={16} />
              <h3 className="text-[11px] font-black uppercase tracking-widest">
                Documento
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEnBlanco("si")}
                className={`py-2 rounded-md text-xs font-bold border transition-all flex justify-center items-center gap-1 ${enBlanco === "si" ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" : "bg-transparent text-[var(--text-muted)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]"}`}
              >
                {enBlanco === "si" && <ArcaIcono size={14} />}{" "}
                {isArca ? "FACTURA (ARCA)" : "FACTURA (PROPIA)"}
              </button>
              <button
                type="button"
                onClick={() => setEnBlanco("no")}
                className={`py-2 rounded-md text-xs font-bold border transition-all flex justify-center items-center gap-1 ${enBlanco === "no" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-transparent text-[var(--text-muted)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]"}`}
              >
                {enBlanco === "no" && <CheckIcono size={14} />} COMPROBANTE X
              </button>
            </div>

            {/* SELECTOR DINÁMICO DE COMPROBANTES (DROPDOWN) */}
            {enBlanco === "si" && (
              <div className="relative group animate-in fade-in slide-in-from-top-2 duration-300">
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className="w-full bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md px-3 py-2.5 text-xs font-black text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer appearance-none uppercase tracking-tighter shadow-inner pr-10"
                >
                  {tiposComprobante.length === 0 && (
                    <option value="">No hay comprobantes habilitados</option>
                  )}
                  {tiposComprobante.map((doc) => (
                    <option
                      key={doc.id}
                      value={doc.id}
                      className="bg-[#151515] text-white py-2"
                    >
                      {doc.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none group-focus-within:text-[var(--primary)] transition-colors">
                  <ComprobanteIcono size={12} />
                </div>
              </div>
            )}

            {enBlanco === "si" && tipoDocumento !== "factura" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 relative">
                <input
                  type="text"
                  value={busquedaFactura}
                  onChange={(e) => {
                    setBusquedaFactura(e.target.value);
                    setComprobanteAsociado(e.target.value);
                    setMostrarDropdownFactura(true);
                  }}
                  onFocus={() => setMostrarDropdownFactura(true)}
                  onBlur={() =>
                    setTimeout(() => setMostrarDropdownFactura(false), 200)
                  }
                  placeholder="Buscador de comprobante (Ej: 0001 o San Martin)"
                  className="w-full bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:font-normal"
                />
                {mostrarDropdownFactura && busquedaFactura && (
                  <div className="absolute top-full mt-1 left-0 right-0 max-h-48 overflow-y-auto custom-scrollbar bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md shadow-2xl z-50 p-1">
                    {facturas
                      .filter((f) =>
                        `${f.prefijo}-${f.numero} ${f.cliente}`
                          .toLowerCase()
                          .includes(busquedaFactura.toLowerCase()),
                      )
                      .map((f) => {
                        const nroCompleto = `${f.prefijo}-${f.numero}`;
                        return (
                          <div
                            key={f.id}
                            onClick={() => {
                              setComprobanteAsociado(nroCompleto);
                              setBusquedaFactura(nroCompleto);
                              setMostrarDropdownFactura(false);
                            }}
                            className="px-3 py-2 flex flex-col hover:bg-[var(--primary)] hover:text-white cursor-pointer rounded-md transition-colors"
                          >
                            <span className="text-xs font-bold">
                              {nroCompleto}
                            </span>
                            <span className="text-[10px] opacity-70 truncate">
                              {f.cliente} • ${f.total}
                            </span>
                          </div>
                        );
                      })}
                    {facturas.filter((f) =>
                      `${f.prefijo}-${f.numero} ${f.cliente}`
                        .toLowerCase()
                        .includes(busquedaFactura.toLowerCase()),
                    ).length === 0 && (
                        <div className="px-3 py-2 text-xs text-[var(--text-muted)] text-center">
                          Sin resultados
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}


            {/* El checkbox de aplicar IVA fue removido para cálculo automático por sesión. */}

          </div>
        )}

        {/* 2. MÉTODO DE PAGO */}
        <div className="bg-[var(--surface)] p-4 rounded-md border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center gap-2 mb-1 text-[var(--text-muted)]">
            <DineroIcono size={16} />
            <h3 className="text-[11px] font-black uppercase tracking-widest">
              Método de Pago
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "efectivo", label: "EFECTIVO" },
              { id: "debito", label: "DÉBITO" },
              { id: "credito", label: "CRÉDITO" },
              { id: "transferencia", label: "TRANSF." },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMetodoPago(m.id)}
                className={`py-3 rounded-md text-[11px] md:text-[10px] font-black border transition-all ${metodoPago === m.id ? "bg-[var(--primary)] text-black border-[var(--primary)] shadow-lg" : "bg-[var(--surface-active)] text-[var(--text-muted)] border-transparent hover:bg-[var(--surface-hover)]"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. CLIENTE */}
        <div className="bg-[var(--surface)] p-4 rounded-md border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <div className="flex items-center gap-2 mb-1">
              <CuentaIcono size={16} />
              <h3 className="text-[11px] font-black uppercase tracking-widest">
                Cliente
              </h3>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Buscar Cliente..."
              value={busquedaCliente}
              onChange={(e) => {
                setBusquedaCliente(e.target.value);
                setClienteSeleccionado("");
                setMostrarDropdownCliente(true);
              }}
              onFocus={() => setMostrarDropdownCliente(true)}
              onBlur={() =>
                setTimeout(() => setMostrarDropdownCliente(false), 200)
              }
              className="w-full bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            />

            {!clienteSeleccionado && !busquedaCliente && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-[var(--text-muted)] pointer-events-none bg-[var(--surface-active)] pl-2">
                Consumidor Final
              </span>
            )}

            {(clienteSeleccionado || busquedaCliente) && (
              <button
                onClick={() => {
                  setClienteSeleccionado("");
                  setBusquedaCliente("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                title="Quitar cliente (Consumidor Final)"
              >
                <BorrarIcono size={16} />
              </button>
            )}

            {mostrarDropdownCliente && busquedaCliente && (
              <div className="absolute top-full mt-1 left-0 right-0 max-h-48 overflow-y-auto custom-scrollbar bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md shadow-2xl z-50 p-1 flex flex-col">
                {Array.isArray(clientes?.data) &&
                  clientes.data
                    .filter((c) =>
                      `${c.nombre} ${c.apellido} ${c.codigoSecuencial}`
                        .toLowerCase()
                        .includes(busquedaCliente.toLowerCase()),
                    )
                    .map((c) => (
                      <div
                        key={c.codigoSecuencial}
                        onClick={() => {
                          setClienteSeleccionado(c.codigoSecuencial);
                          setBusquedaCliente(`${c.nombre} ${c.apellido}`);
                          setMostrarDropdownCliente(false);
                        }}
                        className="px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--primary)] hover:text-white cursor-pointer rounded-md font-medium"
                      >
                        <span className="font-bold opacity-50 mr-2">
                          [{c.codigoSecuencial}]
                        </span>
                        {c.nombre} {c.apellido}
                      </div>
                    ))}
                {Array.isArray(clientes?.data) &&
                  clientes.data.filter((c) =>
                    `${c.nombre} ${c.apellido} ${c.codigoSecuencial}`
                      .toLowerCase()
                      .includes(busquedaCliente.toLowerCase()),
                  ).length === 0 && (
                    <div className="px-3 py-2 text-xs text-[var(--text-muted)] text-center">
                      No se encontraron clientes
                    </div>
                  )}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-white">
              <TarjetaIcono size={14} />
              <select
                value={condicionVenta}
                onChange={(e) => setCondicionVenta(e.target.value)}
                className="bg-transparent text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider focus:outline-none cursor-pointer p-0 m-0 border-none flex-1"
              >
                <option value="contado" className="bg-[#151515]">
                  PAGO AL CONTADO
                </option>
                <option value="cuenta_corriente" className="bg-[#151515]">
                  CUENTA CORRIENTE
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER TOTALES Y BOTÓN (Solo Desktop) */}
      <div className="hidden md:flex shrink-0 p-5 bg-[var(--surface)] border-t border-[var(--border-subtle)] flex-col gap-4">
        {esTipoA && (
          <div className="space-y-1.5 px-1">
            <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
              <span>Subtotal (Neto)</span>
              <span>
                $
                {totales.subtotal.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            {enBlanco === "si" && aplicaIva && (
              <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                <span>Impuestos (IVA)</span>
                <span>
                  $
                  {totales.iva.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-end justify-between px-1">
          <span className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-1">
            Total
          </span>
          <span className="text-2xl font-black tabular-nums tracking-tighter text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
            $
            {totales.total.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <button
          onClick={handleFacturar}
          disabled={items.length === 0}
          className={`w-full h-14 rounded-md flex items-center justify-center gap-3 font-black text-xl uppercase tracking-widest transition-all duration-300 shadow-xl border
                    ${items.length === 0
              ? "bg-[var(--surface-active)] text-[var(--text-muted)] border-transparent cursor-not-allowed opacity-50"
              : "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400 shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1"
            }
                `}
        >
          {items.length > 0 && <VentasIcono size={24} />}
          COBRAR (F2)
        </button>
      </div>
    </div>
  );
};

export default PanelPago;
