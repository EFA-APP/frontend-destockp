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
  metodoPago,
  totales,
  confirmarVentaFinal,
  enBlanco,
  aplicaIva,
  tipoDocumento,
  cargandoCobro,
}) => {
  if (!mostrarPreview) return null;

  const esTipoA = [1, 2, 3, 4, 5].includes(Number(tipoDocumento));

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setMostrarPreview(false)}
      />
      {/* Drawer Content */}
      <div className="relative w-full md:w-[450px] bg-[#111] h-full shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-500">
        {/* OVERLAY DE CARGA PREMIUM */}
        {cargandoCobro && (
          <div className="absolute inset-0 z-[1100] bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckIcono size={24} className="text-emerald-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-white uppercase tracking-widest">
                  Generando Comprobante
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                  Esto puede demorar unos segundos
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Header del Drawer */}
        <div className="p-6 border-b border-white/5 bg-[#151515] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
              Confirmar Cobro
            </h2>
            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">
              Resumen previo a facturación
            </p>
          </div>
          <button
            onClick={() => setMostrarPreview(false)}
            className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors"
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
              <span className="text-[10px] font-black uppercase tracking-widest">
                Detalle de Venta
              </span>
            </div>
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-start border-b border-white/5 pb-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">
                    {item.cantidad} x {item.nombre}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    P. Unit: ${item.precioUnitario.toLocaleString()}
                  </span>
                </div>
                <span className="text-sm font-black text-white/90">
                  ${(item.cantidad * item.precioUnitario).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Datos del Cliente y Método */}
          <div className="pt-6 grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-3 rounded-md border border-white/5">
              <span className="block text-[9px] text-[var(--text-muted)] font-black uppercase mb-1">
                Cliente
              </span>
              <span className="text-xs font-bold text-white truncate block">
                {clienteSeleccionado || "Consumidor Final"}
              </span>
            </div>
            <div className="bg-white/5 p-3 rounded-md border border-white/5">
              <span className="block text-[9px] text-[var(--text-muted)] font-black uppercase mb-1">
                Pago
              </span>
              <span className="text-xs font-bold text-emerald-400 uppercase">
                {metodoPago}
              </span>
            </div>
          </div>
        </div>

        {/* Panel de Totales y Botón Final */}
        <div className="p-6 bg-[#0a0a0a] border-top border-white/10 space-y-4">
          <div className="space-y-2">
            {esTipoA && (
              <>
                <div className="flex justify-between text-white/50 text-xs">
                  <span>SUBTOTAL (NETO)</span>
                  <span>
                    $
                    {totales.subtotal.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {enBlanco === "si" && aplicaIva && (
                  <div className="flex justify-between text-white/50 text-xs">
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
            <div className="flex justify-between text-white text-3xl font-black mt-2 pt-2 border-t border-white/5">
              <span className="tracking-tighter">TOTAL</span>
              <span className="text-emerald-500">
                $
                {totales.total.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <button
            onClick={confirmarVentaFinal}
            disabled={cargandoCobro}
            className={`w-full py-5 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-3 uppercase tracking-tighter active:scale-95 border-none cursor-pointer ${cargandoCobro
              ? "bg-white/10 text-white/50 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
              }`}
          >
            {cargandoCobro ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
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
            className="w-full text-[var(--text-muted)] hover:text-white py-2 text-xs font-bold transition-colors uppercase tracking-widest disabled:opacity-20 disabled:cursor-not-allowed"
          >
            Volver al ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacionCobro;
