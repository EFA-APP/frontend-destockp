import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { emitirCuotaIndividualApi } from "../../../../Backend/Escuela/api/cuotas.api";
import { useAlertas } from "../../../../store/useAlertas";
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
  const agregarAlerta = useAlertas((s) => s.agregarAlerta);
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

  // Bugfix puntual "reemitir tras anulación" (2026-07-12, ver
  // progress/impl_cuotas-reemitir-tras-anulacion.md): "ANULADO" se trata
  // igual que "SIN_EMITIR" (candidato a (re)emitir) — el backend ya
  // soporta esto (`VerificarCuotaPeriodo.casodeuso.ts` excluye
  // `estado: { not: "ANULADO" }` de la verificación de idempotencia).
  // Solo bloquea para cualquier otro estado (PENDIENTE_PAGO,
  // PARCIALMENTE_ABONADO, ABONADO).
  const yaEmitida = fila.estado !== "SIN_EMITIR" && fila.estado !== "ANULADO";
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
      const res = await emitirCuotaIndividualApi({
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

      if (res?.omitido) {
        throw new Error(
          res.motivo === "ya_emitido"
            ? `La cuota ya había sido emitida previamente (Comprobante #${res.codigoComprobanteExistente}).`
            : "La cuota fue omitida por el sistema."
        );
      }

      queryClient.invalidateQueries({ queryKey: ["cuotas-listar"] });
      queryClient.invalidateQueries({ queryKey: ["deuda-alumno"] });
      queryClient.invalidateQueries({ queryKey: ["deudas-cobro-cuota"] });
      agregarAlerta("Cuota emitida correctamente", "success");
      onExito();
    } catch (err) {
      const backendMsg = err?.response?.data?.message;
      const genericMsg = err?.message || "Error al emitir cuota";
      setError(backendMsg || genericMsg);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-black tracking-tight text-gray-800">
            Emitir a {nombreCompleto}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-xs font-semibold text-gray-500">
            Se emitirá la cuota de{" "}
            <span className="font-bold text-gray-700">{nombreMes} {anio}</span> para la cuenta{" "}
            <span className="font-bold text-gray-700">{cuenta.nombre}</span>.
          </p>

          <div className="flex flex-col gap-3 text-xs font-bold text-gray-600">
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
                  className="w-full bg-white border border-gray-300 rounded-md pl-8 pr-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-sm disabled:opacity-50 disabled:bg-gray-50"
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
            disabled={yaEmitida || emitiendo || !codigoTipoComprobante}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm bg-[#1FAE6D] hover:bg-[#178F58] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {emitiendo ? "Emitiendo..." : "Confirmar emisión"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEmitirIndividual;
