import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, CheckCircle2, Calendar, Clipboard, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ModalPagoGuia = ({ cliente, onToggleSelectEnvio, onClose }) => {
  const navigate = useNavigate();

  // 1. Filtrar guías pendientes
  const guiasPendientes = useMemo(() => {
    return cliente?.envios || [];
  }, [cliente]);

  // 2. Estado de selección y montos
  const [seleccionadas, setSeleccionadas] = useState(() => {
    const initial = {};
    guiasPendientes.forEach((g) => {
      initial[g.codigoSecuencial] = true;
    });
    return initial;
  });

  const [montosManuales, setMontosManuales] = useState(() => {
    const initial = {};
    guiasPendientes.forEach((g) => {
      initial[g.codigoSecuencial] = g.totalEnvio;
    });
    return initial;
  });

  const toggleSeleccion = (id, totalEnvio) => {
    setSeleccionadas((prev) => {
      const nuevo = { ...prev, [id]: !prev[id] };
      if (nuevo[id] && !montosManuales[id]) {
        setMontosManuales((m) => ({ ...m, [id]: totalEnvio }));
      }
      return nuevo;
    });
  };

  const handleMontoChange = (id, valor) => {
    const num = parseFloat(valor) || 0;
    setMontosManuales((prev) => ({ ...prev, [id]: num }));
  };

  const totalSeleccionado = useMemo(() => {
    return Object.keys(seleccionadas)
      .filter((id) => seleccionadas[id])
      .reduce((sum, id) => sum + (montosManuales[id] || 0), 0);
  }, [seleccionadas, montosManuales]);

  const handleContinuarAlCobro = () => {
    const itemsCobro = [];
    const guiasIds = [];

    Object.keys(seleccionadas)
      .filter((id) => seleccionadas[id])
      .forEach((id) => {
        const numId = Number(id);
        const guia = guiasPendientes.find((g) => g.codigoSecuencial === numId);
        const montoAbonado = montosManuales[id];

        if (guia && montoAbonado > 0) {
          guiasIds.push(numId);
          itemsCobro.push({
            nombre: `Servicio Flete Guía #${String(id).padStart(6, "0")}`,
            descripcion: `Trayecto: ${guia.ruta?.origen || "Córdoba"} a ${guia.ruta?.destino || "Villa María"} | Detalle: ${guia.descripcionPaquete || "Flete general"}`,
            cantidad: 1,
            precioUnitario: montoAbonado,
            tasaIva: 0,
            codigoEnvio: numId,
          });
        }
      });

    if (itemsCobro.length === 0) return;

    // Redirigir al módulo de facturación con el estado necesario
    navigate("/panel/ventas/comprobantes", {
      state: {
        origen: "TRANSPORTE_GUIAS",
        formaPagoGuia: "CTA_CTE",
        accion: "RECIBO",
        cliente: cliente.cliente,
        itemsCobro,
        guiasIds,
        importe: totalSeleccionado,
      },
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-black/10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Encabezado */}
        <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Clipboard size={22} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter leading-none">
                Cobro de Guías Pendientes
              </h2>
              <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">
                {cliente.nombre}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full text-black/20 hover:text-black/60 transition-all cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Listado de Guías */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">
              <Calendar size={14} />
              <span>Selecciona las guías a liquidar y cobrar</span>
            </div>

            {guiasPendientes.length === 0 ? (
              <div className="p-10 text-center bg-black/5 rounded-2xl border border-dashed border-black/10">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                <p className="text-sm font-black text-black/40 uppercase tracking-widest">
                  No tiene guías pendientes registradas en Cuenta Corriente
                </p>
              </div>
            ) : (
              guiasPendientes.map((guia) => (
                <div
                  key={guia.codigoSecuencial}
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    seleccionadas[guia.codigoSecuencial]
                      ? "bg-orange-500/5 border-orange-500/30 shadow-lg shadow-orange-500/5"
                      : "bg-white border-black/5 hover:border-black/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={!!seleccionadas[guia.codigoSecuencial]}
                      onChange={() => toggleSeleccion(guia.codigoSecuencial, guia.totalEnvio)}
                      className="w-5 h-5 rounded-md border-black/20 text-orange-500 focus:ring-orange-500 cursor-pointer"
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-black text-slate-800 tracking-tight">
                          Guía #{String(guia.codigoSecuencial).padStart(6, "0")}
                        </span>
                        <div className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/10">
                          {guia.estadoDespacho}
                        </div>
                      </div>
                      
                      <div className="text-[11px] font-bold text-gray-500 mt-1 flex items-center gap-1.5">
                        <span>{guia.ruta?.origen || "Córdoba"}</span>
                        <ArrowRight size={10} className="text-gray-400" />
                        <span>{guia.ruta?.destino || "Villa María"}</span>
                        {guia.descripcionPaquete && (
                          <span className="text-gray-400 font-medium italic">| "{guia.descripcionPaquete}"</span>
                        )}
                      </div>

                      <div className="text-[10px] font-extrabold text-gray-400 mt-0.5">
                        Registrada: {new Date(guia.fechaEnvio).toLocaleDateString("es-AR")}
                      </div>
                    </div>

                    {seleccionadas[guia.codigoSecuencial] && (
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-[9px] font-black text-gray-400 uppercase">Monto</span>
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus-within:border-orange-500 transition-all">
                          <span className="text-[12px] font-black text-gray-400">$</span>
                          <input
                            type="number"
                            value={montosManuales[guia.codigoSecuencial] || ""}
                            onChange={(e) => handleMontoChange(guia.codigoSecuencial, e.target.value)}
                            className="w-24 bg-transparent outline-none text-right font-black text-[14.5px] text-gray-800 focus:ring-0 p-0 border-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black/5 bg-black/[0.02] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Seleccionado</span>
            <span className="text-[24px] font-black text-orange-600 leading-none mt-1">
              {formatCurrency(totalSeleccionado)}
            </span>
          </div>

          <button
            onClick={handleContinuarAlCobro}
            disabled={totalSeleccionado <= 0}
            className={`flex items-center gap-2.5 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
              totalSeleccionado > 0
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95"
                : "bg-black/10 text-black/20 cursor-not-allowed"
            }`}
          >
            <span>Continuar al Cobro</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalPagoGuia;
