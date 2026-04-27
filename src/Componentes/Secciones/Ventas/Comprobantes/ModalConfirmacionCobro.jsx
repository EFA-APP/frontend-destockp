import { memo } from "react";
import {
  CerrarIcono,
  CarritoIcono,
  CheckIcono,
  DineroIcono,
} from "../../../../assets/Icons";

const ModalConfirmacionCobro = ({
  mostrarPreview,
  setMostrarPreview,
  items,
  clienteSeleccionado,
  listaPagos = [],
  totales,
  confirmarVentaFinal,
  enBlanco,
  aplicaIva,
  tipoDocumento,
  cargandoCobro,
  vuelto = 0,
}) => {
  if (!mostrarPreview) return null;

  const esTipoA = [1, 2, 3, 4, 5].includes(Number(tipoDocumento));

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm   "
        onClick={() => setMostrarPreview(false)}
      />
      {/* Drawer Content */}
      <div className="relative w-full md:w-[500px] bg-[var(--surface)] h-full shadow-[-30px_0_60px_rgba(0,0,0,0.15)] border-l border-black/5 flex flex-col animate-in slide-in-from-right-full duration-500">
        {/* OVERLAY DE CARGA PREMIUM */}
        {cargandoCobro && (
          <div className="absolute inset-0 z-[1100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-[6px] border-rose-50 border-t-rose-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckIcono size={32} className="text-rose-500" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-[var(--primary)] uppercase tracking-[0.2em]">
                  Procesando Venta
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header del Drawer */}
        <div className="p-8 border-b border-black/5 bg-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black text-[var(--primary)] uppercase tracking-tighter leading-none">
              Confirmar Venta
            </h2>
            <div className="flex items-center gap-2.5 mt-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <p className="text-[12px] text-rose-500/80 font-black uppercase tracking-[0.2em]">
                Resumen Final de Operación
              </p>
            </div>
          </div>
          <button
            onClick={() => setMostrarPreview(false)}
            className="w-12 h-12 flex items-center justify-center hover:bg-rose-50 rounded-full text-[var(--primary)]/20 hover:text-[var(--primary)] transition-all group"
            title="Cerrar vista previa"
          >
            <CerrarIcono
              size={28}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>

        {/* Cuerpo del Resumen */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
          {/* 1. SECCIÓN: DETALLE DE ITEMS (Estilo Ticket) */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 text-[var(--primary)]/80 px-2">
              <CarritoIcono size={20} />
              <span className="text-[14px] font-black uppercase tracking-[0.15em]">
                Detalle del Carrito
              </span>
            </div>
            <div className="bg-white border border-black/5 rounded-3xl p-8 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/10" />
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start group animate-in fade-in slide-in-from-bottom-3 duration-500"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[16px] font-black text-[var(--secondary)] uppercase tracking-tight leading-tight">
                      {item.cantidad} x{" "}
                      <span className="text-[var(--primary)]">
                        {item.nombre}
                      </span>
                    </span>
                    <span className="text-[11px] text-[var(--primary)]/50 font-black uppercase tracking-[0.1em]">
                      P. Unitario: $
                      {item.precioUnitario.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[16px] font-black text-[var(--primary)] tabular-nums">
                      $
                      {(item.cantidad * item.precioUnitario).toLocaleString(
                        "es-AR",
                        { minimumFractionDigits: 2 },
                      )}
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-dashed border-black/50 flex justify-between items-center">
                <span className="text-[11px] font-black text-black/80 uppercase tracking-widest">
                  Subtotal Items
                </span>
                <span className="text-[14px] font-bold text-green-700 tabular-nums">
                  $
                  {items
                    .reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0)
                    .toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </section>

          {/* 2. SECCIÓN: CLIENTE Y RECEPTOR */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[var(--primary)]/80 px-2">
              <div className="w-2 h-2 rounded-full bg-rose-500/40" />
              <span className="text-[13px] font-black uppercase tracking-[0.15em]">
                Información del Cliente
              </span>
            </div>
            <div className="bg-rose-50/30 border border-rose-100 rounded-2xl p-6 flex flex-col gap-2 shadow-sm">
              <span className="text-[10px] text-rose-500/60 font-black uppercase tracking-[0.2em]">
                Receptor del Comprobante
              </span>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-rose-500/20">
                  {(clienteSeleccionado?.razonSocial ||
                    clienteSeleccionado?.nombre ||
                    "C")[0].toUpperCase()}
                </div>
                <div>
                  <span className="text-[18px] font-black text-[var(--primary)] uppercase block leading-none mb-1">
                    {clienteSeleccionado
                      ? clienteSeleccionado.razonSocial ||
                        `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`
                      : "Consumidor Final"}
                  </span>
                  <span className="text-[11px] font-bold text-rose-500/40 uppercase tracking-widest">
                    {clienteSeleccionado?.documento ||
                      "Sin identificación fiscal"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. SECCIÓN: DESGLOSE DE PAGOS */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[var(--primary)]/80 px-2">
              <div className="w-2 h-2 rounded-full bg-rose-500/40" />
              <span className="text-[13px] font-black uppercase tracking-[0.15em]">
                Formas de Pago Aplicadas
              </span>
            </div>
            <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
              {listaPagos.length === 0 ? (
                <div className="text-center py-4 text-black/20 font-bold uppercase text-[10px] tracking-widest italic">
                  No se registraron pagos previos
                </div>
              ) : (
                listaPagos.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-[var(--border-subtle)] rounded-xl border border-black/[0.03]"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-[13px] font-black text-[var(--primary)] uppercase tracking-tight">
                        <p className="bg-[var(--border-subtle)] p-2 rounded-md text-[var(--primary)]">
                          <DineroIcono size={20} />
                        </p>
                        {p.metodo}
                      </span>
                      {p.detalles && (
                        <span className="text-[10px] text-[var(--primary)]/40 font-bold uppercase tracking-[0.05em]">
                          {p.detalles}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[15px] font-black tabular-nums ${p.monto >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {p.monto < 0
                        ? `- $${Math.abs(p.monto).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
                        : `$${p.monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Footer del Drawer: TOTALES Y ACCIÓN */}
        <div className="p-10 pt-0 bg-white border-t-2 border-black/5 space-y-8 shrink-0">
          <div className="space-y-4">
            {esTipoA && (
              <div className="space-y-3 bg-gray-50/50 p-6 rounded-2xl border border-black/5">
                <div className="flex justify-between text-[var(--primary)]/40 text-[11px] font-black uppercase tracking-[0.15em]">
                  <span>Importe Neto Gravado</span>
                  <span className="tabular-nums">
                    $
                    {totales.subtotal.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {enBlanco === "si" && aplicaIva && (
                  <div className="flex justify-between text-[var(--primary)]/40 text-[11px] font-black uppercase tracking-[0.15em]">
                    <span>IVA Liquidado (21%)</span>
                    <span className="tabular-nums">
                      $
                      {totales.iva.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {vuelto > 0 && (
              <div className="flex justify-between items-center bg-emerald-500 border border-emerald-600 p-6 rounded-3xl shadow-xl shadow-emerald-500/20 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-white/70 uppercase tracking-[0.2em] mb-1">
                    Efectivo a Devolver
                  </span>
                  <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                    $
                    {vuelto.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
                  <CheckIcono size={32} className="text-white" />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={confirmarVentaFinal}
              disabled={cargandoCobro}
              className={`w-full h-12 rounded-2xl font-black text-[12px] flex items-center justify-center gap-4 uppercase tracking-[0.15em] transition-all active:scale-[0.98] ${
                cargandoCobro
                  ? "bg-gray-100 text-[var(--primary)]/20 cursor-not-allowed"
                  : "bg-black text-white hover:bg-rose-600 shadow-2xl shadow-black/20 hover:shadow-rose-600/30"
              }`}
            >
              {cargandoCobro ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Emitiendo...</span>
                </div>
              ) : (
                <>
                  <CheckIcono size={18} />
                  Emitir Comprobante
                </>
              )}
            </button>

            <button
              onClick={() => !cargandoCobro && setMostrarPreview(false)}
              disabled={cargandoCobro}
              className="w-full text-[var(--primary)]/30 hover:text-rose-500 py-2 text-[12px] font-black uppercase tracking-[0.2em] transition-colors disabled:opacity-20 flex items-center justify-center gap-2"
            >
              <CerrarIcono size={16} />
              Volver y Modificar Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ModalConfirmacionCobro);
