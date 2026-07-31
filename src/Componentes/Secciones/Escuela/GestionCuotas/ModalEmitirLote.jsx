import { useState } from "react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { emitirLoteCuotasApi } from "../../../../Backend/Escuela/api/cuotas.api";
import ModalProgresoLoteCuotas from "./ModalProgresoLoteCuotas";
import ModalConfirmarEmision from "./ModalConfirmarEmision";
import SelectorTipoComprobanteCuota, {
  useTiposComprobanteCuotaPermitidos,
} from "./SelectorTipoComprobanteCuota";
import { X } from "lucide-react";

const MESES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/**
 * Modal de emisión masiva de cuotas (R42, R54, R103): dispara
 * `cuotas.emitirLote` (asíncrono, responde de inmediato con `codigoLote`) y
 * pasa a mostrar `ModalProgresoLoteCuotas` con el polling del progreso.
 *
 * Optimización de performance (2026-07-14, PARTE 2/2 frontend, ver
 * progress/impl_cuotas-listado-performance-backend.md): el conteo de
 * preview ("a emitir"/"ya emitidos") ya NO se calcula sobre `filas` (que
 * ahora es solo la página actual del listado, no el universo completo) —
 * se recibe `resumen` (mismo objeto de `useResumenCuotas.js`, universo
 * completo bajo los filtros activos) y se usa directamente `sinEmitir`
 * ("a emitir", incluye SIN_EMITIR + ANULADO, mismo criterio que antes) y
 * `totalContactos - sinEmitir` ("ya emitidos").
 */
const ModalEmitirLote = ({
  resumen,
  cuenta,
  tipoEntidadObligado = "ALUM",
  mes,
  anio,
  codigoUnidadNegocio,
  onClose,
  onExito,
}) => {
  const { usuario } = useAuthStore();
  const [emitiendo, setEmitiendo] = useState(false);
  const [error, setError] = useState(null);
  // R2 (bugfix puntual "selector de tipo de comprobante" 2026-07-11, ver
  // progress/impl_cuotas-selector-tipo-comprobante.md): ya no es un booleano
  // esFiscal auto-derivado — el usuario elige explícitamente el tipo real
  // (991/1/6/11) entre los que tiene permitidos, precargado con el primero.
  const tiposComprobantePermitidos = useTiposComprobanteCuotaPermitidos();
  const [codigoTipoComprobante, setCodigoTipoComprobante] = useState(
    () => tiposComprobantePermitidos[0]?.id ?? null,
  );
  const [codigoLote, setCodigoLote] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  // "A emitir" = SIN_EMITIR + ANULADO (mismo criterio de "candidatos a
  // re-emitir" que ya usaba este modal, ahora provisto directo por
  // `cuotas.resumen` en vez de recalcularlo sobre `filas`).
  const pendientes = resumen?.sinEmitir ?? 0;
  const yaEmitidos = resumen
    ? Math.max(resumen.totalContactos - resumen.sinEmitir, 0)
    : 0;

  const unidadSeleccionada = usuario?.unidadesNegocio?.find(
    (u) => String(u.codigo) === String(codigoUnidadNegocio),
  );
  const puntoVenta = unidadSeleccionada?.puntoVenta ?? 1;

  const nombreMes = MESES_ES[mes - 1];

  const handleConfirmar = async () => {
    if (pendientes === 0 || !codigoTipoComprobante) return;
    setEmitiendo(true);
    setError(null);
    try {
      const respuesta = await emitirLoteCuotasApi({
        codigoCuentaContable: cuenta.codigoSecuencial,
        tipoEntidadObligado,
        mes,
        anio,
        codigoTipoComprobante,
        puntoVenta,
        codigoUnidadNegocio: codigoUnidadNegocio
          ? Number(codigoUnidadNegocio)
          : undefined,
      });
      setCodigoLote(respuesta.codigoLote);
    } catch (err) {
      setError(err?.response?.data?.message || "Error al emitir cuotas");
    } finally {
      setEmitiendo(false);
    }
  };

  if (codigoLote) {
    return (
      <ModalProgresoLoteCuotas
        codigoLote={codigoLote}
        onClose={onClose}
        onFinalizado={onExito}
      />
    );
  }

  // R3 (confirmación explícita con Unidad de Negocio) — paso intermedio
  // antes de disparar `cuotas.emitirLote`.
  if (confirmando) {
    return (
      <ModalConfirmarEmision
        nombreUnidad={unidadSeleccionada?.nombre}
        emitiendo={emitiendo}
        error={error}
        onConfirmar={handleConfirmar}
        onCancelar={() => setConfirmando(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-black tracking-tight text-gray-800">
            Generar cuotas — {nombreMes} {anio}
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
            Cuenta:{" "}
            <span className="font-bold text-gray-700">{cuenta?.nombre}</span>.
            Verificá la cantidad antes de emitir masivamente.
          </p>

          <div className="flex flex-col gap-2 text-xs font-bold text-gray-600">
            <p className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span>Alumnos a emitir</span>
              <span className="text-gray-900 font-black text-sm">
                {pendientes}
              </span>
            </p>
            {yaEmitidos > 0 && (
              <p className="text-amber-600 font-bold flex items-center justify-between pb-1">
                <span>Con cuota ya emitida (se omitirán)</span>
                <span>{yaEmitidos}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Tipo de comprobante a emitir
            </span>
            <SelectorTipoComprobanteCuota
              value={codigoTipoComprobante}
              onChange={setCodigoTipoComprobante}
              disabled={emitiendo}
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-md p-4 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}
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
            onClick={() => setConfirmando(true)}
            disabled={emitiendo || pendientes === 0 || !codigoTipoComprobante}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-md shadow-sm bg-[#1FAE6D] hover:bg-[#178F58] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Confirmar emisión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEmitirLote;
