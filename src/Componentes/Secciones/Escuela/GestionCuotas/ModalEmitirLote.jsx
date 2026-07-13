import { useState } from "react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { emitirLoteCuotasApi } from "../../../../Backend/Escuela/api/cuotas.api";
import ModalProgresoLoteCuotas from "./ModalProgresoLoteCuotas";
import ModalConfirmarEmision from "./ModalConfirmarEmision";
import SelectorTipoComprobanteCuota, {
  useTiposComprobanteCuotaPermitidos,
} from "./SelectorTipoComprobanteCuota";

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
 */
const ModalEmitirLote = ({
  filas,
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

  // Bugfix puntual "reemitir tras anulación" (2026-07-12, ver
  // progress/impl_cuotas-reemitir-tras-anulacion.md): "ANULADO" se trata
  // igual que "SIN_EMITIR" (candidato a (re)emitir) en el lote masivo,
  // mismo criterio que ModalEmitirIndividual.jsx/TablaCuotas.jsx.
  const pendientes = filas.filter(
    (f) => f.estado === "SIN_EMITIR" || f.estado === "ANULADO",
  );
  const yaEmitidos = filas.filter(
    (f) => f.estado !== "SIN_EMITIR" && f.estado !== "ANULADO",
  );

  const unidadSeleccionada = usuario?.unidadesNegocio?.find(
    (u) => String(u.codigo) === String(codigoUnidadNegocio),
  );
  const puntoVenta = unidadSeleccionada?.puntoVenta ?? 1;

  const nombreMes = MESES_ES[mes - 1];

  const handleConfirmar = async () => {
    if (pendientes.length === 0 || !codigoTipoComprobante) return;
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
        codigoUnidadNegocio: codigoUnidadNegocio ? Number(codigoUnidadNegocio) : undefined,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-[var(--border-subtle)] rounded-md max-w-lg w-full p-7 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black tracking-tight text-gray-800">
            Generar cuotas — {nombreMes} {anio}
          </h2>
          <p className="text-xs font-semibold text-gray-500">
            Cuenta: {cuenta?.nombre}. Verificá la cantidad antes de emitir masivamente
            (proceso en segundo plano, podés seguir usando el sistema mientras corre).
          </p>
        </div>

        <div className="flex flex-col gap-2 text-xs font-bold text-gray-600">
          <p className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span>Alumnos a emitir</span>
            <span className="text-gray-900 font-black text-sm">{pendientes.length}</span>
          </p>
          {yaEmitidos.length > 0 && (
            <p className="text-amber-600 font-bold flex items-center justify-between pb-1">
              <span>Con cuota ya emitida (se omitirán)</span>
              <span>{yaEmitidos.length}</span>
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

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={emitiendo}
            className="flex-1 py-3 rounded-md bg-white border border-[var(--border-subtle)] text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => setConfirmando(true)}
            disabled={emitiendo || pendientes.length === 0 || !codigoTipoComprobante}
            className="flex-1 py-3 rounded-md bg-[var(--primary)] text-white text-xs font-bold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[var(--primary)]/20"
          >
            Confirmar emisión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEmitirLote;
