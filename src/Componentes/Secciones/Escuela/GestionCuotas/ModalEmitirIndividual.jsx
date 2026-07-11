import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { emitirCuotaIndividualApi } from "../../../../Backend/Escuela/api/cuotas.api";
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
 * Modal de emisión individual de cuota para un alumno (R50, R55, R104):
 * emite una Factura real (fiscal o interna, R6-R8) vía
 * `cuotas.emitirIndividual`, con el monto sugerido por el motor de reglas
 * (§5) como precarga editable (`montoOverride`).
 */
const ModalEmitirIndividual = ({
  fila,
  cuenta,
  tipoEntidadObligado = "ALUM",
  mes,
  anio,
  codigoUnidadNegocio,
  onClose,
  onExito,
}) => {
  const { usuario } = useAuthStore();
  const queryClient = useQueryClient();
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
  const [montoEditable, setMontoEditable] = useState(fila.montoSugerido ?? 0);
  const [confirmando, setConfirmando] = useState(false);

  const yaEmitida = fila.estado !== "SIN_EMITIR";
  const nombreCompleto =
    fila.razonSocial || `${fila.nombre ?? ""} ${fila.apellido ?? ""}`.trim();
  const nombreMes = MESES_ES[mes - 1];

  const unidadSeleccionada = usuario?.unidadesNegocio?.find(
    (u) => String(u.codigo) === String(codigoUnidadNegocio),
  );
  const puntoVenta = unidadSeleccionada?.puntoVenta ?? 1;

  const handleConfirmar = async () => {
    if (yaEmitida || !codigoTipoComprobante) return;
    setEmitiendo(true);
    setError(null);
    try {
      await emitirCuotaIndividualApi({
        codigoCuentaContable: cuenta.codigoSecuencial,
        tipoEntidadObligado,
        mes,
        anio,
        codigoTipoComprobante,
        puntoVenta,
        codigoContacto: fila.codigo,
        codigoUnidadNegocio: codigoUnidadNegocio ? Number(codigoUnidadNegocio) : undefined,
        montoOverride: montoEditable,
      });
      queryClient.invalidateQueries({ queryKey: ["cuotas-listar"] });
      onExito();
    } catch (err) {
      setError(err?.response?.data?.message || "Error al emitir cuota");
    } finally {
      setEmitiendo(false);
    }
  };

  // R3 (confirmación explícita con Unidad de Negocio) — paso intermedio
  // antes de disparar `cuotas.emitirIndividual`.
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
      <div className="bg-white border border-[var(--border-subtle)] rounded-xl max-w-md w-full p-7 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black tracking-tight text-gray-800">
            Emitir cuota individual
          </h2>
          <p className="text-xs font-semibold text-gray-500">
            Cuenta: {cuenta?.nombre}
          </p>
        </div>

        <div className="flex flex-col gap-3 text-xs font-bold text-gray-600">
          <p className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span>Alumno</span>
            <span className="text-gray-900 font-black text-sm uppercase">
              {nombreCompleto}
            </span>
          </p>
          <p className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span>Período</span>
            <span className="text-gray-900 font-black text-sm uppercase">
              {nombreMes} {anio}
            </span>
          </p>
          <div className="flex flex-col gap-1.5 pt-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Monto cuota</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={montoEditable}
                onChange={(e) => setMontoEditable(Number(e.target.value))}
                disabled={yaEmitida || emitiendo}
                className="w-full bg-white border border-[var(--border-subtle)] rounded-md pl-8 pr-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all disabled:opacity-50 disabled:bg-gray-50"
              />
            </div>
            {fila.montoSugerido == null && (
              <p className="text-[11px] text-amber-600 font-bold">
                No hay ninguna regla de monto configurada para este alumno; cargá un monto manual.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Tipo de comprobante a emitir
            </span>
            <SelectorTipoComprobanteCuota
              value={codigoTipoComprobante}
              onChange={setCodigoTipoComprobante}
              disabled={yaEmitida || emitiendo}
            />
          </div>
        </div>

        {yaEmitida && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm font-semibold text-amber-700">
            Ya existe una cuota emitida para este alumno en {mes}/{anio}
          </div>
        )}

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
            disabled={yaEmitida || emitiendo || !codigoTipoComprobante}
            className="flex-1 py-3 rounded-md bg-[var(--primary)] text-white text-xs font-bold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[var(--primary)]/20"
          >
            Emitir cuota
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEmitirIndividual;
