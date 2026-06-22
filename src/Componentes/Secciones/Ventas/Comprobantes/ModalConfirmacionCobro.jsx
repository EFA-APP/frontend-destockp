import { memo, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ShoppingCart,
  User,
  Wallet,
  Coins,
  Check,
  FileText,
  ArrowRightLeft,
  Receipt,
} from "lucide-react";
import { formatPrice } from "../../../../utils/formatters";
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

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop click to close (only if not loading) */}
      <div
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
        onClick={() => !cargandoCobro && setMostrarPreview(false)}
      />

      {/* Modal Content Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-md shadow-2xl border border-gray-100 flex flex-col my-8 max-h-[90vh] md:max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* OVERLAY DE CARGA */}
        {cargandoCobro && (
          <div className="absolute inset-0 z-[1100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-[6px] border-[var(--primary)]/10 border-t-[var(--primary)] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-[var(--primary)]">
                  <Check size={28} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-base font-black text-gray-900 uppercase tracking-widest">
                  Procesando Venta
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                  Por favor espere un momento...
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black">
              <Receipt size={18} />
            </div>
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
              Confirmación de Venta
            </h2>
          </div>
          <button
            onClick={() => !cargandoCobro && setMostrarPreview(false)}
            disabled={cargandoCobro}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-full transition-all group"
          >
            <X
              size={18}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>

        {/* Body (scrollable two columns grid) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* COLUMNA IZQUIERDA: CARRITO Y CLIENTE */}
            <div className="space-y-6">
              {/* Resumen del Carrito */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-wider text-xs">
                  <ShoppingCart size={16} className="text-[var(--primary)]" />
                  <span>Detalle del Carrito</span>
                </div>

                <div className="bg-gray-50/50 border border-gray-200/60 rounded-md p-4 space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-xs font-black text-gray-800 uppercase truncate">
                          {item.nombre}
                        </span>
                        {item.descripcion && (
                          <span className="text-[10px] text-gray-400 font-bold uppercase truncate">
                            {item.descripcion}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-gray-900 tabular-nums">
                          {formatPrice(item.cantidad * item.precioUnitario)}
                        </span>
                        <span className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 font-black px-1.5 py-0.5 rounded ml-2">
                          x{item.cantidad}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center text-xs font-bold text-gray-500">
                  <span>Subtotal de Items</span>
                  <span className="text-[var(--primary)] font-black text-sm">
                    {formatPrice(
                      items.reduce(
                        (acc, i) => acc + i.cantidad * i.precioUnitario,
                        0,
                      ),
                    )}
                  </span>
                </div>
              </section>

              {/* Información del Cliente */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-wider text-xs">
                  <User size={16} className="text-[var(--primary)]" />
                  <span>Información del Cliente</span>
                </div>

                {clienteSeleccionado ? (
                  <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-md p-4 flex items-center justify-between shadow-sm animate-in zoom-in-95">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-[var(--primary)] text-white flex items-center justify-center font-black shadow-md shadow-[var(--primary)]/20">
                        <User size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--primary)] block leading-none mb-1">
                          Cliente Registrado
                        </span>
                        <span className="text-sm font-extrabold text-gray-900 uppercase block">
                          {clienteSeleccionado.razonSocial ||
                            `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`}
                        </span>
                        <span className="text-[9px] font-bold text-[var(--primary)]/60 uppercase">
                          {clienteSeleccionado.documento || "DNI/CUIT S/D"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200/60 rounded-md p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-gray-200 text-gray-500 flex items-center justify-center font-black">
                      <User size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block leading-none mb-1">
                        Cliente
                      </span>
                      <span className="text-sm font-extrabold text-gray-800 uppercase block">
                        Consumidor Final
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        Sin identificación fiscal
                      </span>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* COLUMNA DERECHA: FORMAS DE PAGO Y SALDO NC */}
            <div className="space-y-6">
              {/* Formas de Pago */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-wider text-xs">
                  <Wallet size={16} className="text-[var(--primary)]" />
                  <span>Formas de Pago</span>
                </div>

                <div className="bg-gray-50/50 border border-gray-200/60 rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {listaPagos.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">
                      No hay pagos registrados
                    </div>
                  ) : (
                    listaPagos.map((p, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-2.5 bg-white border border-gray-200/50 rounded-md shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-[var(--primary)]/10 p-2 rounded-md text-[var(--primary)]">
                            <Coins size={16} />
                          </div>
                          <span className="text-xs font-black text-gray-800 uppercase tracking-tight">
                            {p.tipo}
                          </span>
                        </div>
                        <span className="text-xs font-black text-[var(--primary)] tabular-nums">
                          {formatPrice(p.monto)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Manejo Saldo NC (Si es Nota de Crédito) */}
              {esNC && (
                <section className="space-y-3 animate-in zoom-in-95 duration-500">
                  <div className="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-wider text-xs">
                    <ArrowRightLeft size={16} />
                    <span>Manejo de Saldo (Nota de Crédito)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setManejoSaldoNC("favor")}
                      className={`p-3 rounded-md border-2 transition-all flex flex-col items-center gap-2 text-center active:scale-98 ${
                        manejoSaldoNC === "favor"
                          ? "bg-[var(--primary)]/5 border-[var(--primary)] text-[var(--primary)] shadow-sm"
                          : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          manejoSaldoNC === "favor"
                            ? "bg-[var(--primary)] text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        <Check size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase">
                        Saldo a Favor
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setManejoSaldoNC("reintegro")}
                      className={`p-3 rounded-md border-2 transition-all flex flex-col items-center gap-2 text-center active:scale-98 ${
                        manejoSaldoNC === "reintegro"
                          ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm"
                          : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          manejoSaldoNC === "reintegro"
                            ? "bg-rose-500 text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        <X size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase">
                        Reintegro
                      </span>
                    </button>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 md:p-6 bg-[#f8fafc] border-t border-gray-100 space-y-4 shrink-0">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Detalle Fiscal si aplica Tipo A */}
            <div className="flex flex-wrap gap-4 items-center">
              {esTipoA && (
                <div className="flex gap-4 text-xs font-black uppercase tracking-wider text-gray-500">
                  <div>
                    Neto Gravado:{" "}
                    <span className="text-gray-900 font-extrabold">
                      {formatPrice(totales.subtotal)}
                    </span>
                  </div>
                  {enBlanco === "si" && aplicaIva && (
                    <div>
                      IVA (21%):{" "}
                      <span className="text-gray-900 font-extrabold">
                        {formatPrice(totales.iva)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Total Final */}
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Total a Cobrar:{" "}
                <span className="text-gray-900 font-black text-xl ml-1">
                  {formatPrice(totales.total)}
                </span>
              </div>
            </div>

            {/* Vuelto / Cambio */}
            {vuelto > 0 && (
              <div className="flex items-center gap-3 bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-4 py-2 rounded-md shadow-sm animate-in zoom-in-95 shrink-0 self-start md:self-auto">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-[var(--primary)] uppercase tracking-wider leading-none">
                    Vuelto / Cambio
                  </span>
                  <span className="text-lg font-black text-gray-900 tabular-nums">
                    {formatPrice(vuelto)}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-[var(--primary)] text-white flex items-center justify-center">
                  <Check size={14} />
                </div>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => !cargandoCobro && setMostrarPreview(false)}
              disabled={cargandoCobro}
              className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-black uppercase tracking-wider text-xs transition active:scale-98 disabled:opacity-50"
            >
              Volver / Modificar
            </button>
            <button
              onClick={() =>
                confirmarVentaFinal({
                  manejoSaldoNC: esNC ? manejoSaldoNC : null,
                })
              }
              disabled={cargandoCobro}
              className={`flex-[2] h-12 rounded-md font-black text-xs flex items-center justify-center gap-2 uppercase tracking-wider transition active:scale-98 ${
                cargandoCobro
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-lg shadow-[var(--primary)]/20"
              }`}
            >
              {cargandoCobro ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <FileText size={16} />
                  <span>Finalizar Venta y Generar Comprobante</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default memo(ModalConfirmacionCobro);
