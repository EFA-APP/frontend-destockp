import { memo } from "react";
import {
  CerrarIcono,
  CarritoIcono,
  CheckIcono,
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
      <div className="relative w-full md:w-[450px] bg-[#111] h-full shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-black/10 flex flex-col   ">
        {/* OVERLAY DE CARGA PREMIUM */}
        {cargandoCobro && (
          <div className="absolute inset-0 z-[1100] bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center   ">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-700/10 border-t-emerald-700 " />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckIcono size={24} className="text-emerald-700 " />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-black uppercase tracking-widest">
                  Generando Comprobante
                </p>
                <p className="text-[12px] text-black/40 uppercase tracking-widest mt-1">
                  Esto puede demorar unos segundos
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Header del Drawer */}
        <div className="p-6 border-b border-black/5 bg-[var(--surface-hover)] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-tighter">
              Confirmar Cobro
            </h2>
            <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">
              Resumen previo a facturación
            </p>
          </div>
          <button
            onClick={() => setMostrarPreview(false)}
            className="p-2 hover:bg-black/5 rounded-full text-black/50 hover:text-black "
            title="Cerrar vista previa"
          >
            <CerrarIcono size={24} />
          </button>
        </div>

        {/* Listado de Items en el resumen */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[var(--primary-light)] mb-4">
              <CarritoIcono size={16} />
              <span className="text-[12px] font-black uppercase tracking-widest">
                Detalle de Venta
              </span>
            </div>
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-start border-b border-black/5 pb-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-black">
                    {item.cantidad} x {item.nombre}
                  </span>
                  <span className="text-[12px] text-[var(--text-muted)]">
                    P. Unit: ${item.precioUnitario.toLocaleString()}
                  </span>
                </div>
                <span className="text-sm font-black text-black/90">
                  ${(item.cantidad * item.precioUnitario).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Datos del Cliente y Método */}
          <div className="pt-6 flex flex-col gap-4">
            <div className="bg-black/5 p-4 rounded-md border border-black/5 flex flex-col gap-1">
              <span className="block text-[11px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                Cliente / Receptor
              </span>
              <span className="text-sm font-bold text-black uppercase italic">
                {clienteSeleccionado
                  ? clienteSeleccionado.razonSocial ||
                    `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`
                  : "Consumidor Final"}
              </span>
            </div>

            <div className="bg-black/5 p-4 rounded-md border border-black/5">
              <span className="block text-[11px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-3">
                Desglose de Pago
              </span>
              <div className="space-y-2">
                {listaPagos.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-black uppercase">
                        {p.metodo}
                      </span>
                      {p.detalles && (
                        <span className="text-[11px] text-[var(--text-muted)] font-black italic">
                          {p.detalles}
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-black ${p.monto >= 0 ? "text-emerald-400" : "text-rose-700"}`}
                    >
                      {p.monto < 0
                        ? `- $${Math.abs(p.monto).toLocaleString("es-AR")}`
                        : `$${p.monto.toLocaleString("es-AR")}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Totales y Botón Final */}
        <div className="p-6 bg-[#0a0a0a] border-top border-black/10 space-y-4">
          <div className="space-y-2">
            {esTipoA && (
              <>
                <div className="flex justify-between text-black/50 text-xs">
                  <span>SUBTOTAL (NETO)</span>
                  <span>
                    $
                    {totales.subtotal.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {enBlanco === "si" && aplicaIva && (
                  <div className="flex justify-between text-black/50 text-xs">
                    <span>IVA</span>
                    <span>
                      $
                      {totales.iva.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between text-black text-3xl font-black mt-2 pt-2 border-t border-black/5">
              <span className="tracking-tighter">TOTAL</span>
              <span className="text-emerald-700">
                $
                {totales.total.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            {vuelto > 0 && (
              <div className="flex justify-between items-center bg-emerald-700/10 border border-emerald-700/20 p-4 rounded-xl     mt-4 shadow-lg shadow-emerald-700/5">
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-emerald-400/60 uppercase tracking-[0.2em] mb-1">
                    Vuelto a entregar
                  </span>
                  <span className="text-2xl font-black text-emerald-400 tabular-nums">
                    $
                    {vuelto.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-700/10 flex items-center justify-center border border-emerald-700/20">
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-700/30 border-t-emerald-700 " />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={confirmarVentaFinal}
            disabled={cargandoCobro}
            className={`w-full py-5 rounded-xl font-black text-lg  flex items-center justify-center gap-3 uppercase tracking-tighter active:scale-95 border-none cursor-pointer ${
              cargandoCobro
                ? "bg-black/10 text-black/50 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
            }`}
          >
            {cargandoCobro ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-3 border-black/20 border-t-white rounded-full " />
                <span>Procesando...</span>
              </div>
            ) : (
              <>
                <CheckIcono size={24} />
                Confirmar y Cobrar
              </>
            )}
          </button>

          <button
            onClick={() => !cargandoCobro && setMostrarPreview(false)}
            disabled={cargandoCobro}
            className="w-full text-[var(--text-muted)] hover:text-black py-2 text-xs font-bold  uppercase tracking-widest disabled:opacity-20 disabled:cursor-not-allowed"
          >
            Volver al ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ModalConfirmacionCobro);
