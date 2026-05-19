import { memo, useState } from "react";
import {
  CerrarIcono,
  CarritoIcono,
  CheckIcono,
  DineroIcono,
} from "../../../../assets/Icons";
import { formatPrice } from "../../../../utils/formatters";
import { ArrowRightLeft, Receipt, FileText } from "lucide-react";

import { esNotaCredito } from "./reglas/reglasFiscales";

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
  const [manejoSaldoNC, setManejoSaldoNC] = useState("favor");

  if (!mostrarPreview) return null;

  const esTipoA = [1, 2, 3, 4, 5, 201, 206, 211].includes(
    Number(tipoDocumento),
  );
  const esNC = esNotaCredito(tipoDocumento);

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => setMostrarPreview(false)}
      />

      {/* Drawer Content */}
      <div className="relative w-full md:w-[500px] bg-[var(--surface)] h-screen shadow-[-30px_0_60px_rgba(0,0,0,0.15)] border-l border-black/5 flex flex-col animate-in slide-in-from-right-full duration-500">
        {/* OVERLAY DE CARGA */}
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

        {/* Header */}
        <div className="p-4 md:p-5 bg-[var(--primary)]/10 border-b border-[var(--primary)]/10 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black text-[var(--primary)] uppercase tracking-tighter leading-none">
            Confirmar Venta
          </h2>
          <button
            onClick={() => setMostrarPreview(false)}
            className="w-8 h-8 flex items-center justify-center bg-[var(--primary)]/20 rounded-md text-[var(--primary)]/80 border border-[var(--primary)]/80 hover:text-[var(--primary)] transition-all group"
          >
            <CerrarIcono
              size={28}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6 md:space-y-8">
          {/* Items */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 text-[var(--primary)]/80 px-2">
              <CarritoIcono size={20} />
              <span className="text-[14px] font-black uppercase tracking-[0.15em]">
                Detalle del Carrito
              </span>
            </div>
            <div className="bg-white border border-black/5 rounded-2xl p-4 md:p-6 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/10" />
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start animate-in fade-in slide-in-from-bottom-3 duration-500"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-medium text-[var(--secondary)] uppercase tracking-tight leading-tight">
                      <span className="text-[var(--primary)]">
                        {item.nombre}
                      </span>
                    </span>
                    <span className="text-[11px] text-[var(--primary)]/50 font-black uppercase tracking-[0.1em]">
                      {item.descripcion}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[16px] font-black text-[var(--primary)] tabular-nums">
                      {formatPrice(item.cantidad * item.precioUnitario)}
                      <span className="text-red-500 font-black p-2 rounded-full ml-2">
                        {item.cantidad}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-dashed border-black/50 flex justify-between items-center">
                <span className="text-[11px] font-black text-black/80 uppercase tracking-widest">
                  Subtotal Items
                </span>
                <span className="text-[14px] font-bold text-green-700 tabular-nums">
                  {formatPrice(
                    items.reduce(
                      (acc, i) => acc + i.cantidad * i.precioUnitario,
                      0,
                    ),
                  )}
                </span>
              </div>
            </div>
          </section>

          {/* Cliente */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[var(--primary)]/80 px-2">
              <div className="w-2 h-2 rounded-full bg-rose-500/40" />
              <span className="text-[13px] font-black uppercase tracking-[0.15em]">
                Información del Cliente
              </span>
            </div>
            <div className="bg-rose-50/30 border border-rose-100 rounded-2xl p-6 flex flex-col gap-2 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md bg-rose-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-rose-500/20">
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

          {/* Pagos */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[var(--primary)]/80 px-2">
              <div className="w-2 h-2 rounded-full bg-rose-500/40" />
              <span className="text-[13px] font-black uppercase tracking-[0.15em]">
                Formas de Pago
              </span>
            </div>
            <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
              {listaPagos.length === 0 ? (
                <div className="text-center py-4 text-black/20 font-bold uppercase text-[10px] tracking-widest italic">
                  No hay pagos registrados
                </div>
              ) : (
                listaPagos.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-[var(--border-subtle)] rounded-md border border-black/[0.03]"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-[13px] font-black text-[var(--primary)] uppercase tracking-tight">
                        <div className="bg-[var(--border-subtle)] p-2 rounded-md text-[var(--primary)]">
                          <DineroIcono size={20} />
                        </div>
                        {p.tipo}
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
                      {formatPrice(p.monto)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Manejo Saldo NC */}
          {esNC && (
            <section className="space-y-4 animate-in zoom-in-95 duration-500">
              <div className="flex items-center gap-3 text-rose-600 px-2">
                <ArrowRightLeft size={20} />
                <span className="text-[13px] font-black uppercase tracking-[0.15em]">
                  Manejo de Saldo (NC)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setManejoSaldoNC("favor")}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center ${manejoSaldoNC === "favor" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-black/5 text-black/40"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${manejoSaldoNC === "favor" ? "bg-emerald-500 text-white" : "bg-black/5"}`}
                  >
                    <CheckIcono size={20} />
                  </div>
                  <span className="text-[12px] font-black uppercase">
                    Saldo a Favor
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setManejoSaldoNC("reintegro")}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center ${manejoSaldoNC === "reintegro" ? "bg-rose-50 border-rose-500 text-rose-700" : "bg-white border-black/5 text-black/40"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${manejoSaldoNC === "reintegro" ? "bg-rose-500 text-white" : "bg-black/5"}`}
                  >
                    <CerrarIcono size={20} />
                  </div>
                  <span className="text-[12px] font-black uppercase">
                    Reintegro
                  </span>
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 pb-6 md:pb-8 bg-white border-t border-black/5 space-y-4 shrink-0">
          <div className="space-y-3">
            {esTipoA && (
              <div className="space-y-2 bg-gray-50/50 p-4 rounded-xl border border-black/5">
                <div className="flex justify-between text-[var(--primary)]/40 text-[11px] font-black uppercase tracking-[0.15em]">
                  <span>Neto Gravado</span>
                  <span className="tabular-nums">
                    {formatPrice(totales.subtotal)}
                  </span>
                </div>
                {enBlanco === "si" && aplicaIva && (
                  <div className="flex justify-between text-[var(--primary)]/40 text-[11px] font-black uppercase tracking-[0.15em]">
                    <span>IVA (21%)</span>
                    <span className="tabular-nums">
                      {formatPrice(totales.iva)}
                    </span>
                  </div>
                )}
              </div>
            )}
            {vuelto > 0 && (
              <div className="flex justify-between items-center bg-emerald-500 p-4 rounded-2xl shadow-xl shadow-emerald-500/20">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-white/70 uppercase mb-1">
                    Vuelto
                  </span>
                  <span className="text-4xl font-black text-white tabular-nums">
                    {formatPrice(vuelto)}
                  </span>
                </div>
                <CheckIcono size={32} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() =>
                confirmarVentaFinal({
                  manejoSaldoNC: esNC ? manejoSaldoNC : null,
                })
              }
              disabled={cargandoCobro}
              className={`w-full h-12 rounded-2xl font-black text-[12px] flex items-center justify-center gap-4 uppercase tracking-[0.15em] transition-all ${cargandoCobro ? "bg-gray-100 text-black/20" : "bg-black text-white hover:bg-rose-600 shadow-2xl"}`}
            >
              {cargandoCobro ? "Emitiendo..." : "generar Comprobante"}
            </button>
            <button
              onClick={() => !cargandoCobro && setMostrarPreview(false)}
              disabled={cargandoCobro}
              className="w-full text-[var(--primary)]/30 hover:text-rose-500 py-2 text-[12px] font-black uppercase tracking-[0.2em]"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ModalConfirmacionCobro);
