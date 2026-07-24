import { useState } from "react";
import { X, CheckCircle, AlertTriangle } from "lucide-react";
import { useCobrarChequeTerceroMutation } from "../../../../Backend/Comprobantes/queries/useCobrarChequeTercero.mutation";
import { useRechazarChequeTerceroMutation } from "../../../../Backend/Comprobantes/queries/useRechazarChequeTercero.mutation";
import { formatPrice } from "../../../../utils/formatters";
import CuentaBancariaAutocomplete from "../../../UI/Select/CuentaBancariaAutocomplete";

const FieldLabel = ({ children }) => (
  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-2">
    {children}
  </span>
);

// Feature cheques-terceros-integracion-bancos (R1, R38): la acción
// DEPOSITAR se elimina de este modal por completo — depositar un cheque
// (solo o junto con otros/efectivo) pasa a hacerse exclusivamente desde
// Bancos > Depósitos. Este modal pasa a manejar solo COBRAR/RECHAZAR.
const ModalDestinoCheque = ({ cheque, accion, onClose }) => {
  const esRepresentacion = accion === "COBRAR" && cheque.estado === "RECHAZADO";

  // R35, R40: selector de CuentaBancaria real de tesoreria-ms (en lugar del
  // plan de cuentas de contabilidad-ms). El estado guarda la CuentaBancaria
  // completa; se convierte a codigoCuentaBancaria (su `codigo`) recién al
  // armar el payload de la mutation.
  const [cuentaBancaria, setCuentaBancaria] = useState(null);
  const [importeCobrado, setImporteCobrado] = useState(
    esRepresentacion ? String(cheque.importe) : "",
  );

  const mCobrar = useCobrarChequeTerceroMutation();
  const mRechazar = useRechazarChequeTerceroMutation();

  const isPending = mCobrar.isPending || mRechazar.isPending;

  const mostrarAdvertencias = (data) => {
    if (data?.advertencias?.length > 0) {
      alert(`Advertencia:\n\n${data.advertencias.join("\n")}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (accion === "RECHAZAR") {
      mRechazar.mutate(cheque.codigo, {
        onSuccess: (data) => {
          alert("Cheque rechazado correctamente");
          mostrarAdvertencias(data);
          onClose();
        },
        onError: (err) => alert(err.message),
      });
      return;
    }

    if (!cuentaBancaria) {
      alert("Debe seleccionar una cuenta destino");
      return;
    }

    if (accion === "COBRAR") {
      mCobrar.mutate(
        {
          codigo: cheque.codigo,
          codigoCuentaBancaria: cuentaBancaria.codigo,
          importeCobrado: importeCobrado ? Number(importeCobrado) : undefined,
        },
        {
          onSuccess: (data) => {
            alert(
              esRepresentacion
                ? "Cheque re-presentado y acreditado correctamente"
                : "Cheque cobrado correctamente",
            );
            mostrarAdvertencias(data);
            onClose();
          },
          onError: (err) => alert(err.message),
        },
      );
    }
  };

  const accionConfig = {
    COBRAR: {
      titulo: esRepresentacion ? "Re-presentar Cheque" : "Cobrar Cheque",
      color: "text-[#1FAE6D]",
      btnClass: "bg-[#1FAE6D] hover:bg-[#178F58]",
    },
    RECHAZAR: {
      titulo: "Rechazar Cheque",
      color: "text-rose-600",
      btnClass: "bg-rose-600 hover:bg-rose-700",
    },
  };

  const cfg = accionConfig[accion];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-md shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50 rounded-t-md">
          <h2 className={`text-sm font-black uppercase tracking-widest ${cfg.color}`}>
            {cfg.titulo}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Detalle del Cheque
            </p>
            <p className="text-sm font-bold text-gray-800">
              Banco {cheque.banco} - N° {cheque.numero}
            </p>
            <p className="text-xl font-black text-gray-900 mt-1">
              {formatPrice(cheque.importe)}
            </p>
          </div>

          {accion === "RECHAZAR" ? (
            <div className="flex gap-3 text-sm font-medium text-rose-700 bg-rose-50 p-4 rounded-md border border-rose-200">
              <AlertTriangle size={20} className="shrink-0 text-rose-600" />
              <div>
                <span className="font-bold block mb-1">Confirmación de Rechazo</span>
                ¿Está seguro que desea marcar este cheque como RECHAZADO? Esta acción no se puede deshacer.
              </div>
            </div>
          ) : (
            <form
              id="accion-cheque-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {esRepresentacion && (
                <div className="flex gap-3 text-sm font-medium text-emerald-700 bg-emerald-50 p-4 rounded-md border border-emerald-200">
                  <AlertTriangle size={20} className="shrink-0 text-emerald-600" />
                  <div>
                    <span className="font-bold block mb-1">Re-presentación</span>
                    Este cheque fue RECHAZADO previamente. Al confirmar, se re-presenta y pasa a ACREDITADO.
                  </div>
                </div>
              )}

              <div>
                <CuentaBancariaAutocomplete
                  label="Cuenta Destino"
                  value={cuentaBancaria}
                  onChange={setCuentaBancaria}
                />
              </div>

              {esRepresentacion && (
                <div>
                  <FieldLabel>Importe Cobrado</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={importeCobrado}
                      onChange={(e) => setImporteCobrado(e.target.value)}
                      className="w-full h-11 bg-white border border-gray-300 rounded-md pl-9 pr-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-md">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors uppercase tracking-wider"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="accion-cheque-form"
            onClick={accion === "RECHAZAR" ? handleSubmit : undefined}
            disabled={isPending}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white rounded-md shadow-sm transition-all uppercase tracking-wider ${cfg.btnClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPending ? "Procesando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDestinoCheque;
