import { useState } from "react";
import SelectorTipoComprobanteCuota, {
  useTiposComprobanteCuotaPermitidos,
} from "../../Escuela/GestionCuotas/SelectorTipoComprobanteCuota";
import { X } from "lucide-react";

const ModalConfirmarImportacion = ({
  filasAImportar,
  obraSocial,
  onClose,
  onConfirmar,
}) => {
  const [emitiendo, setEmitiendo] = useState(false);
  const tiposComprobantePermitidos = useTiposComprobanteCuotaPermitidos();

  // Este selector elige el TIPO de comprobante (Interna/A/B/C, ids
  // 991/1/6/11 — ver SelectorTipoComprobanteCuota), no el punto de venta:
  // el punto de venta real ya se resolvió en el paso 1 desde la Unidad de
  // Negocio elegida (Bug 2, progress/impl_obra-sociales-importaciones.md).
  const [codigoTipoComprobante, setCodigoTipoComprobante] = useState(
    () => tiposComprobantePermitidos[0]?.id ?? null,
  );

  // Feature 27 (obra-sociales-facturacion-por-paciente), R9: separar las
  // filas que efectivamente van a facturarse (matcheadas + marcadas para
  // crear como CLIE) de las que se omitirán (sin match y sin autorización
  // de alta) — el payload sigue enviando TODAS las filas al backend (más
  // abajo, en onConfirmar), esto es solo para mostrarle al usuario
  // expectativas correctas antes de confirmar.
  const aEmitir = filasAImportar.filter(
    (f) => f.contactoEncontrado || f.crearComoClie,
  );
  const omitidas = filasAImportar.filter(
    (f) => !f.contactoEncontrado && !f.crearComoClie,
  );

  const montoTotal = aEmitir.reduce(
    (acc, curr) => acc + (curr.total_facturar || 0),
    0,
  );

  const handleConfirmar = async () => {
    if (!codigoTipoComprobante) return;
    setEmitiendo(true);
    try {
      await onConfirmar({
        codigoTipoComprobante,
      });
    } catch (err) {
      setEmitiendo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-black tracking-tight text-gray-800">
            Confirmar Importación
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-xs font-semibold text-gray-500">
            Obra Social:{" "}
            <strong className="text-gray-700">
              {obraSocial?.razonSocial ||
                `${obraSocial?.nombre} ${obraSocial?.apellido}`.trim()}
            </strong>
          </p>

          <div className="flex flex-col gap-3 p-5 bg-[var(--color-neutral-bg)] rounded-[var(--radius-base)] border border-[var(--color-neutral-border)]">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-[var(--color-neutral-text-muted)]">
                Facturas a generar
              </span>
              <span className="text-[18px] font-black text-[var(--color-neutral-text-main)]">
                {aEmitir.length}
              </span>
            </div>
            <div className="h-px bg-[var(--color-neutral-border)] w-full" />
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-[var(--color-neutral-text-muted)]">
                Monto Total
              </span>
              <span className="text-[18px] font-black text-[var(--color-brand-primary)]">
                $
                {montoTotal.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {omitidas.length > 0 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-[var(--radius-base)]">
              <svg
                className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-[13px] text-amber-800 font-semibold">
                {omitidas.length}{" "}
                {omitidas.length === 1
                  ? "fila se omitirá"
                  : "filas se omitirán"}{" "}
                (paciente no encontrado, sin autorización de alta).
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-neutral-text-muted)]">
              Tipo de Comprobante
            </label>
            <SelectorTipoComprobanteCuota
              value={codigoTipoComprobante}
              onChange={setCodigoTipoComprobante}
              disabled={emitiendo}
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={emitiendo}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={emitiendo || !codigoTipoComprobante}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-md shadow-sm bg-[#1FAE6D] hover:bg-[#178F58] disabled:opacity-50 transition-all cursor-pointer"
          >
            {emitiendo ? "Generando..." : "Confirmar Importación"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarImportacion;
