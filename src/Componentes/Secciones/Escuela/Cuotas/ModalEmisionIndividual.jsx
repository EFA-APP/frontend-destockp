import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Save, Calendar, DollarSign, FileText, AlertTriangle } from "lucide-react";

const ModalEmisionIndividual = ({
  alumno,
  periodoActual,
  emitirCuota,
  onClose,
}) => {
  const [form, setForm] = useState({
    periodo: periodoActual,
    monto: alumno.montoCuotaActual || 0,
    concepto: `CUOTA MES ${periodoActual.split("-")[1]}/${periodoActual.split("-")[0]}`,
  });

  const [cargando, setCargando] = useState(false);

  // Detectar si el alumno cambió de tipo respecto a cuotas anteriores
  const { montoPrevio, tipoCambio } = useMemo(() => {
    const cuotas = alumno.cuotas ? Object.values(alumno.cuotas) : [];
    if (!cuotas.length) return { montoPrevio: null, tipoCambio: false };
    // Ordenar por periodo desc para obtener la cuota más reciente
    const sorted = [...cuotas].sort((a, b) =>
      (b.periodo || "").localeCompare(a.periodo || "")
    );
    const ultima = sorted[0];
    const montoUltimo = ultima?.montoOriginal ?? ultima?.monto;
    const montoActual = alumno.montoCuotaActual || 0;
    const cambio = montoUltimo != null && Math.abs(montoUltimo - montoActual) > 0.01;
    return { montoPrevio: montoUltimo, tipoCambio: cambio };
  }, [alumno]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.monto || form.monto <= 0) return;

    setCargando(true);
    try {
      // Calcular fecha de vencimiento (día 10 del periodo seleccionado)
      const [anio, mes] = form.periodo.split("-");
      const fVenc = new Date(parseInt(anio), parseInt(mes) - 1, 10);

      await emitirCuota(
        alumno.codigo,
        form.periodo,
        form.monto,
        form.concepto,
        fVenc.toISOString(),
      );
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                Emitir Cuota Individual
              </h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase">
                {alumno.nombre} {alumno.apellido}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {/* Tipo alumno + alerta cambio de tipo */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo:</span>
            {(() => {
              const tipo = alumno.atributos?.tipo_alumno || "EXTERNO";
              return (
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                    tipo === "INTERNO"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-orange-50 text-orange-700 border-orange-200"
                  }`}
                >
                  {tipo}
                </span>
              );
            })()}
            <span className="text-[10px] font-bold text-gray-500">
              Monto calculado:{" "}
              <span className="font-black text-gray-800">
                $ {Number(alumno.montoCuotaActual || 0).toLocaleString("es-AR")}
              </span>
            </span>
          </div>

          {tipoCambio && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-wide">
                  Cambio de tipo detectado
                </p>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  La última cuota emitida fue de{" "}
                  <strong>$ {Number(montoPrevio).toLocaleString("es-AR")}</strong>. El monto
                  actual según el tipo del alumno es{" "}
                  <strong>$ {Number(alumno.montoCuotaActual || 0).toLocaleString("es-AR")}</strong>.
                  El monto fue actualizado automáticamente.
                </p>
              </div>
            </div>
          )}

          {/* Periodo */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Periodo / Mes
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Calendar size={14} />
              </div>
              <input
                type="month"
                value={form.periodo}
                onChange={(e) => {
                  const [anio, mes] = e.target.value.split("-");
                  setForm({
                    ...form,
                    periodo: e.target.value,
                    concepto: `CUOTA MES ${mes}/${anio}`,
                  });
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-md pl-10 pr-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Monto */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Monto de la Cuota
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500">
                <DollarSign size={14} />
              </div>
              <input
                type="number"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                placeholder="0.00"
                className="w-full bg-gray-50 border border-gray-200 rounded-md pl-10 pr-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Concepto */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Concepto
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FileText size={14} />
              </div>
              <input
                type="text"
                value={form.concepto}
                onChange={(e) =>
                  setForm({ ...form, concepto: e.target.value.toUpperCase() })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-md pl-10 pr-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3.5 bg-emerald-600 text-white rounded-md text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {cargando ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={14} />
                  <span>Emitir Cuota</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ModalEmisionIndividual;
