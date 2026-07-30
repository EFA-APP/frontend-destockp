import { useState } from "react";
import { X, ArrowUpCircle, ArrowDownCircle, Check, SlidersHorizontal } from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useAlertas } from "../../../../store/useAlertas";
import { useCrearMovimientoBancarioAjusteMutation } from "../../../../Backend/Tesoreria/queries/useMovimientosBancarios.query";
import { SelectorCuentaImputable } from "../../../Modales/Tesoreria/SelectorCuentaImputable";

const FieldLabel = ({ children }) => (
  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">
    {children}
  </span>
);

const hoyISO = () => new Date().toISOString().slice(0, 10);

// Feature "bancos" (T47, R18): alta manual de un MovimientoBancario de
// ajuste (ingreso o egreso), mismo patrón que ModalMovimientoManual.jsx.
// Feature "conciliacion-extracto-csv-galicia" (R18-R21, design.md §3.9):
// props opcionales de prellenado (`signoInicial`/`importeInicial`/
// `descripcionInicial`/`fechaInicial`) para el uso nuevo desde
// `Conciliacion.jsx` (alta de ajuste a partir de una línea de diferencia,
// con la fecha vista en el extracto). Sin estas props (uso actual desde
// `LibroBanco.jsx`), el comportamiento es idéntico al anterior: sin campo
// de fecha, sin `fecha` en el payload.
const ModalAjusteMovimiento = ({
  cuenta,
  onClose,
  signoInicial,
  importeInicial,
  descripcionInicial,
  fechaInicial,
}) => {
  const { usuario, unidadActiva } = useAuthStore();
  const agregarAlerta = useAlertas((s) => s.agregarAlerta);

  const [signo, setSigno] = useState(signoInicial ?? "INGRESO");
  const [importe, setImporte] = useState(
    importeInicial !== undefined && importeInicial !== null ? String(importeInicial) : "",
  );
  const [descripcion, setDescripcion] = useState(descripcionInicial ?? "");
  const [cuentaImputada, setCuentaImputada] = useState(null);
  const [fecha, setFecha] = useState(fechaInicial ?? hoyISO());

  const mAjuste = useCrearMovimientoBancarioAjusteMutation();

  const handleKeyDownNext = (e) => {
    if (e.key === "Enter" && e.target.tagName !== "BUTTON" && e.target.type !== "submit") {
      e.preventDefault();
      const formEl = e.currentTarget;
      const focusables = Array.from(
        formEl.querySelectorAll("select:not([disabled]), input:not([disabled]), textarea:not([disabled]), button:not([disabled])")
      );
      const idx = focusables.indexOf(e.target);
      if (idx >= 0 && idx < focusables.length - 1) {
        focusables[idx + 1].focus();
        if (focusables[idx + 1].select) focusables[idx + 1].select();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const montoNumerico = Number(importe);
    if (!montoNumerico || montoNumerico <= 0) {
      agregarAlerta({ type: "error", message: "El importe debe ser mayor a 0" });
      return;
    }
    if (!descripcion.trim()) {
      agregarAlerta({ type: "error", message: "La descripción es obligatoria" });
      return;
    }
    if (!cuentaImputada) {
      agregarAlerta({ type: "error", message: "Debe seleccionar la cuenta a imputar" });
      return;
    }

    mAjuste.mutate(
      {
        payload: {
          codigoCuentaBancaria: cuenta.codigo,
          signo,
          importe: montoNumerico,
          descripcion: descripcion.trim(),
          codigoCuentaImputada: cuentaImputada.codigoSecuencial || cuentaImputada.codigo,
          // R18-R21: solo se envía `fecha` cuando el modal se abrió con
          // prellenado (`fechaInicial`, uso nuevo desde Conciliacion.jsx).
          // Sin `fechaInicial` (uso actual desde LibroBanco.jsx), el
          // payload no incluye `fecha` — comportamiento idéntico al
          // anterior (el backend resuelve `new Date()`).
          ...(fechaInicial ? { fecha } : {}),
        },
        contexto: {
          codigoEmpresa: usuario?.codigoEmpresa,
          codigoUnidadNegocio: unidadActiva?.codigo,
        },
      },
      {
        onSuccess: (data) => {
          agregarAlerta({ type: "success", message: "Movimiento de ajuste registrado" });
          if (data?.advertencias?.length > 0) {
            agregarAlerta({ type: "warning", message: data.advertencias.join(" ") });
          }
          onClose();
        },
        onError: (err) =>
          agregarAlerta({ type: "error", message: err?.response?.data?.message || err.message }),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-gray-100 overflow-hidden">
        {/* HEADER CORPORATIVO */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-[#1FAE6D] border border-emerald-200/60 flex items-center justify-center font-black">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-gray-900">
                Ajuste Manual de Saldo
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                Registrá ingresos o egresos directos de fondos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-gray-900 rounded-md transition-all shadow-sm cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form
          id="form-ajuste"
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDownNext}
          className="p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setSigno("INGRESO"); setCuentaImputada(null); }}
              className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-md text-xs font-black uppercase tracking-widest border transition-all cursor-pointer ${
                signo === "INGRESO"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm"
                  : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <ArrowUpCircle size={20} className={signo === "INGRESO" ? "text-emerald-600" : "text-gray-400"} />
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => { setSigno("EGRESO"); setCuentaImputada(null); }}
              className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-md text-xs font-black uppercase tracking-widest border transition-all cursor-pointer ${
                signo === "EGRESO"
                  ? "bg-rose-50 text-rose-700 border-rose-300 shadow-sm"
                  : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <ArrowDownCircle size={20} className={signo === "EGRESO" ? "text-rose-600" : "text-gray-400"} />
              Egreso
            </button>
          </div>

          <div>
            <FieldLabel>Importe</FieldLabel>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={importe}
              onChange={(e) => setImporte(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="0.00"
              className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm font-black text-gray-900 bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm transition-all"
            />
          </div>

          {fechaInicial && (
            <div>
              <FieldLabel>Fecha (según extracto)</FieldLabel>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm font-black text-gray-900 bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm transition-all"
              />
            </div>
          )}

          <div>
            <FieldLabel>Descripción</FieldLabel>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              onFocus={(e) => e.target.select()}
              rows="2"
              placeholder="Concepto del ajuste..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm transition-all resize-none"
            />
          </div>

          <SelectorCuentaImputable
            tipoOperacion={signo}
            value={cuentaImputada}
            onChange={setCuentaImputada}
            codigoEmpresa={usuario?.codigoEmpresa}
          />
        </form>

        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-black uppercase tracking-wider text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md shadow-sm transition-all cursor-pointer"
            disabled={mAjuste.isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-ajuste"
            disabled={mAjuste.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-[#1FAE6D] hover:bg-[#178F58] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={16} strokeWidth={3} />
            {mAjuste.isPending ? "Guardando..." : "Registrar Ajuste"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAjusteMovimiento;
