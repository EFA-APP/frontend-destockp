import { useState } from "react";
import { X, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useEntregarChequePropioMutation } from "../../../../Backend/Comprobantes/queries/useEntregarChequePropio.mutation";
import { useCobrarChequePropioMutation } from "../../../../Backend/Comprobantes/queries/useCobrarChequePropio.mutation";
import { useRechazarChequePropioMutation } from "../../../../Backend/Comprobantes/queries/useRechazarChequePropio.mutation";
import { useAnularChequePropioMutation } from "../../../../Backend/Comprobantes/queries/useAnularChequePropio.mutation";
import { useAlertas } from "../../../../store/useAlertas";
import { formatPrice } from "../../../../utils/formatters";

// Feature "bancos" (T47, T49, R53-R57): transiciones de estado de un
// ChequePropio, mismo patrón que ChequeTercero/ModalDestinoCheque.jsx.
// R56: la re-presentación de un cheque RECHAZADO reusa la acción "COBRAR"
// (mismo endpoint /cobrar, tesoreria-ms acepta ambos orígenes).
const ModalAccionChequePropio = ({ cheque, accion, onClose }) => {
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;
  const agregarAlerta = useAlertas((s) => s.agregarAlerta);

  const esRepresentacion = accion === "COBRAR" && cheque.estado === "RECHAZADO";

  const [destinatario, setDestinatario] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const mEntregar = useEntregarChequePropioMutation();
  const mCobrar = useCobrarChequePropioMutation();
  const mRechazar = useRechazarChequePropioMutation();
  const mAnular = useAnularChequePropioMutation();

  const isPending = mEntregar.isPending || mCobrar.isPending || mRechazar.isPending || mAnular.isPending;

  const onSuccess = (mensaje) => (data) => {
    agregarAlerta({ type: "success", message: mensaje });
    if (data?.advertencias?.length > 0) {
      agregarAlerta({ type: "warning", message: data.advertencias.join(" ") });
    }
    onClose();
  };

  const onError = (err) =>
    agregarAlerta({ type: "error", message: err?.response?.data?.message || err.message });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (accion === "ENTREGAR") {
      mEntregar.mutate(
        { codigo: cheque.codigo, codigoEmpresa, destinatario: destinatario || undefined, observaciones: observaciones || undefined },
        { onSuccess: onSuccess("Cheque entregado correctamente"), onError },
      );
    } else if (accion === "COBRAR") {
      mCobrar.mutate(
        { codigo: cheque.codigo, codigoEmpresa, observaciones: observaciones || undefined },
        {
          onSuccess: onSuccess(esRepresentacion ? "Cheque re-presentado y cobrado correctamente" : "Cheque cobrado correctamente"),
          onError,
        },
      );
    } else if (accion === "RECHAZAR") {
      mRechazar.mutate(
        { codigo: cheque.codigo, codigoEmpresa, motivoRechazo: motivoRechazo || undefined, observaciones: observaciones || undefined },
        { onSuccess: onSuccess("Cheque rechazado correctamente"), onError },
      );
    } else if (accion === "ANULAR") {
      mAnular.mutate(
        { codigo: cheque.codigo, codigoEmpresa, observaciones: observaciones || undefined },
        { onSuccess: onSuccess("Cheque anulado correctamente"), onError },
      );
    }
  };

  const accionConfig = {
    ENTREGAR: { titulo: "Entregar Cheque", color: "text-cyan-600", btnClass: "bg-cyan-600 hover:bg-cyan-700" },
    COBRAR: {
      titulo: esRepresentacion ? "Re-presentar Cheque" : "Cobrar Cheque",
      color: "text-emerald-600",
      btnClass: "bg-emerald-600 hover:bg-emerald-700",
    },
    RECHAZAR: { titulo: "Rechazar Cheque", color: "text-rose-600", btnClass: "bg-rose-600 hover:bg-rose-700" },
    ANULAR: { titulo: "Anular Cheque", color: "text-gray-600", btnClass: "bg-gray-700 hover:bg-gray-800" },
  };
  const cfg = accionConfig[accion];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
          <h2 className={`text-lg font-black tracking-tight ${cfg.color}`}>{cfg.titulo}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-lg space-y-1">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Detalle del Cheque</p>
            <p className="text-sm font-semibold text-gray-800">Banco {cheque.banco} - N° {cheque.numero}</p>
            <p className="text-lg font-black text-gray-900">{formatPrice(cheque.importe)}</p>
          </div>

          {accion === "ANULAR" ? (
            <div className="flex items-center gap-3 text-sm font-medium text-rose-700 bg-rose-50 p-4 rounded-lg border border-rose-100">
              <AlertTriangle size={20} className="shrink-0" />
              ¿Está seguro que desea anular este cheque? Esta acción no se puede deshacer.
            </div>
          ) : (
            <form id="accion-cheque-propio-form" onSubmit={handleSubmit} className="space-y-4">
              {esRepresentacion && (
                <div className="flex items-center gap-3 text-sm font-medium text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <AlertTriangle size={18} className="shrink-0" />
                  Este cheque fue RECHAZADO previamente. Al confirmar, se re-presenta y pasa a COBRADO (R56).
                </div>
              )}

              {accion === "ENTREGAR" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Destinatario</label>
                  <input
                    type="text"
                    value={destinatario}
                    onChange={(e) => setDestinatario(e.target.value)}
                    placeholder="Proveedor o tercero..."
                    className="w-full h-9 px-3 border border-[var(--border-subtle)] rounded-md text-xs bg-white focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              )}

              {accion === "RECHAZAR" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Motivo de rechazo</label>
                  <input
                    type="text"
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    className="w-full h-9 px-3 border border-[var(--border-subtle)] rounded-md text-xs bg-white focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Observaciones (opcional)</label>
                <input
                  type="text"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full h-9 px-3 border border-[var(--border-subtle)] rounded-md text-xs bg-white focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors" disabled={isPending}>
            Cancelar
          </button>
          <button
            type="submit"
            form="accion-cheque-propio-form"
            onClick={accion === "ANULAR" ? handleSubmit : undefined}
            disabled={isPending}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all ${cfg.btnClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPending ? "Procesando..." : "Confirmar"}
            <CheckCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAccionChequePropio;
