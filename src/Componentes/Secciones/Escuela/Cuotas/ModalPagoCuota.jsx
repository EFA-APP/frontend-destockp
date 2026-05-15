import React, { useState, useMemo } from "react";
import {
  X,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ModalPagoCuota = ({ alumno, onClose }) => {
  const navigate = useNavigate();

  // 1. Filtrar cuotas pendientes o vencidas
  const cuotasPendientes = useMemo(() => {
    if (!alumno?.cuotas) return [];
    return Object.values(alumno.cuotas)
      .filter((c) => c.estado !== "pagado")
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
  }, [alumno]);

  // 2. Estado de selección y montos
  const [seleccionadas, setSeleccionadas] = useState({}); // { periodo: true/false }
  const [montosManuales, setMontosManuales] = useState({}); // { periodo: monto }

  const toggleSeleccion = (periodo, montoOriginal) => {
    setSeleccionadas((prev) => {
      const nuevo = { ...prev, [periodo]: !prev[periodo] };
      if (nuevo[periodo] && !montosManuales[periodo]) {
        setMontosManuales((m) => ({ ...m, [periodo]: montoOriginal }));
      }
      return nuevo;
    });
  };

  const handleMontoChange = (periodo, valor) => {
    const num = parseFloat(valor) || 0;
    setMontosManuales((prev) => ({ ...prev, [periodo]: num }));
  };

  const totalSeleccionado = useMemo(() => {
    return Object.keys(seleccionadas)
      .filter((p) => seleccionadas[p])
      .reduce((sum, p) => sum + (montosManuales[p] || 0), 0);
  }, [seleccionadas, montosManuales]);

  const handleContinuarAlCobro = () => {
    const itemsCobro = [];

    Object.keys(seleccionadas)
      .filter((p) => seleccionadas[p])
      .forEach((p) => {
        const cuota = alumno.cuotas[p];
        const montoAbonado = montosManuales[p];

        // Calculamos cuánto de lo abonado es cuota base y cuánto es interés
        // Si hay interés original, lo separamos
        const cuotaBaseOriginal = cuota.monto - cuota.interes;

        if (montoAbonado <= cuotaBaseOriginal) {
          // Todo es pago parcial de cuota
          itemsCobro.push({
            nombre: `CUOTA ESCOLAR - ${cuota.periodoFormateado}`,
            cantidad: 1,
            precioUnitario: montoAbonado,
            tasaIva: 0,
            periodo: p,
          });
        } else {
          // Cubre la cuota base y parte del interés
          itemsCobro.push({
            nombre: `CUOTA ESCOLAR - ${cuota.periodoFormateado}`,
            cantidad: 1,
            precioUnitario: cuotaBaseOriginal,
            tasaIva: 0,
            periodo: p,
          });

          const montoInteres = montoAbonado - cuotaBaseOriginal;
          itemsCobro.push({
            nombre: `INTERÉS POR MORA - ${cuota.periodoFormateado} (${cuota.diasAtraso} DÍAS)`,
            cantidad: 1,
            precioUnitario: montoInteres,
            tasaIva: 0,
            periodo: p,
          });
        }
      });

    if (itemsCobro.length === 0) return;

    navigate("/panel/ventas/comprobantes", {
      state: {
        origen: "ESCUELA_CUOTAS",
        cliente: alumno,
        itemsCobro,
        periodo: itemsCobro[0].periodo,
      },
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--surface)] border border-black/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gradient-to-r from-[var(--primary)]/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white shadow-lg shadow-[var(--primary)]/20">
              <CreditCard size={24} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[20px] font-black text-black/80 uppercase tracking-tighter leading-none">
                Cobro de Cuotas
              </h2>
              <p className="text-[11px] font-bold text-black/30 uppercase tracking-[0.2em] mt-1">
                {alumno.nombre} {alumno.apellido}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full text-black/20 hover:text-black/60 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[11px] font-black text-black/40 uppercase tracking-widest mb-2">
              <Calendar size={14} />
              <span>Cuotas Pendientes de Pago</span>
            </div>

            {cuotasPendientes.length === 0 ? (
              <div className="p-10 text-center bg-black/5 rounded-2xl border border-dashed border-black/10">
                <CheckCircle2
                  size={48}
                  className="mx-auto text-emerald-500 mb-4"
                />
                <p className="text-sm font-black text-black/40 uppercase tracking-widest">
                  El alumno no tiene deudas pendientes
                </p>
              </div>
            ) : (
              cuotasPendientes.map((cuota) => (
                <div
                  key={cuota.periodo}
                  className={`
                    p-4 rounded-2xl border transition-all duration-300
                    ${
                      seleccionadas[cuota.periodo]
                        ? "bg-[var(--primary)]/5 border-[var(--primary)]/30 shadow-lg shadow-[var(--primary)]/5"
                        : "bg-white/[0.02] border-black/5 hover:border-black/10"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={!!seleccionadas[cuota.periodo]}
                      onChange={() =>
                        toggleSeleccion(cuota.periodo, cuota.monto)
                      }
                      className="w-5 h-5 rounded-md border-black/20 text-[var(--primary)] focus:ring-[var(--primary)]"
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-black text-black/80 uppercase tracking-tight">
                          {cuota.periodoFormateado}
                        </span>
                        <div
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${cuota.estado === "vencido" ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"}`}
                        >
                          {cuota.estado}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-bold text-black/30">
                          Total: {formatCurrency(cuota.monto)}
                        </span>
                        {cuota.interes > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-amber-600">
                              Mora: {formatCurrency(cuota.interes)}
                            </span>
                            {cuota.diasAtraso > 0 && (
                              <span className="text-[9px] font-medium text-amber-600/60">
                                ({cuota.diasAtraso} días)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {seleccionadas[cuota.periodo] && (
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-[9px] font-black text-black/40 uppercase">
                          Abonar
                        </span>
                        <div className="flex items-center gap-1 bg-white border border-black/10 rounded-md px-2 py-1">
                          <span className="text-[12px] font-bold text-black/40">
                            $
                          </span>
                          <input
                            type="number"
                            value={montosManuales[cuota.periodo] || ""}
                            onChange={(e) =>
                              handleMontoChange(cuota.periodo, e.target.value)
                            }
                            className="w-24 bg-transparent outline-none text-right font-black text-[14px] text-black/80"
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
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
              Total Seleccionado
            </span>
            <span className="text-[24px] font-black text-[var(--primary)] leading-none mt-1">
              {formatCurrency(totalSeleccionado)}
            </span>
          </div>

          <button
            onClick={handleContinuarAlCobro}
            disabled={totalSeleccionado <= 0}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
              ${
                totalSeleccionado > 0
                  ? "bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/30 hover:scale-[1.02] active:scale-95"
                  : "bg-black/10 text-black/20 cursor-not-allowed"
              }
            `}
          >
            <span>Continuar al Cobro</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPagoCuota;
