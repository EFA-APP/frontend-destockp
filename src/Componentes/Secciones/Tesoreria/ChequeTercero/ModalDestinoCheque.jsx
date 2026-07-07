import { useState, useEffect } from "react";
import { X, CheckCircle, AlertTriangle } from "lucide-react";
import { useObtenerDescendientesImputablesQuery } from "../../../../Backend/Contabilidad/queries/useCuentas.query";
import { useDepositarChequeTerceroMutation } from "../../../../Backend/Comprobantes/queries/useDepositarChequeTercero.mutation";
import { useCobrarChequeTerceroMutation } from "../../../../Backend/Comprobantes/queries/useCobrarChequeTercero.mutation";
import { useRechazarChequeTerceroMutation } from "../../../../Backend/Comprobantes/queries/useRechazarChequeTercero.mutation";
import { formatPrice } from "../../../../utils/formatters";
import SearchableSelect from "../../../UI/Select/SearchableSelect";
import { useMemo } from "react";

const ModalDestinoCheque = ({ cheque, accion, onClose }) => {
  const [codigoCuentaDestino, setCodigoCuentaDestino] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busqueda), 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  // 110102 es el parent "Bancos" (codigoSecuencial: 110102)
  const { data: bancos, isLoading: isLoadingBancos } =
    useObtenerDescendientesImputablesQuery(110102, busquedaDebounced || undefined);

  const cuentaOptions = useMemo(() => {
    const opts = [];
    
    // Inyectamos Caja Principal si no hay búsqueda, o si la búsqueda coincide con "caja"
    if (!busquedaDebounced || "caja principal".includes(busquedaDebounced.toLowerCase())) {
      opts.push({ value: "85", label: "Caja Principal" });
    }

    if (bancos && bancos.length > 0) {
      bancos.forEach((b) => {
        opts.push({ value: String(b.codigo), label: b.nombre });
      });
    }
    return opts;
  }, [bancos, busquedaDebounced]);

  const mDepositar = useDepositarChequeTerceroMutation();
  const mCobrar = useCobrarChequeTerceroMutation();
  const mRechazar = useRechazarChequeTerceroMutation();

  const isPending =
    mDepositar.isPending || mCobrar.isPending || mRechazar.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (accion === "RECHAZAR") {
      mRechazar.mutate(cheque.codigo, {
        onSuccess: () => {
          alert("Cheque rechazado correctamente");
          onClose();
        },
        onError: (err) => alert(err.message),
      });
      return;
    }

    if (!codigoCuentaDestino) {
      alert("Debe seleccionar una cuenta destino");
      return;
    }

    const payload = {
      codigo: cheque.codigo,
      codigoCuentaDestino: Number(codigoCuentaDestino),
    };

    if (accion === "DEPOSITAR") {
      mDepositar.mutate(payload, {
        onSuccess: () => {
          alert("Cheque depositado correctamente");
          onClose();
        },
        onError: (err) => alert(err.message),
      });
    } else if (accion === "COBRAR") {
      mCobrar.mutate(payload, {
        onSuccess: () => {
          alert("Cheque cobrado correctamente");
          onClose();
        },
        onError: (err) => alert(err.message),
      });
    }
  };

  const accionConfig = {
    DEPOSITAR: {
      titulo: "Depositar Cheque",
      color: "text-blue-600",
      btnClass: "bg-blue-600 hover:bg-blue-700",
    },
    COBRAR: {
      titulo: "Cobrar Cheque",
      color: "text-emerald-600",
      btnClass: "bg-emerald-600 hover:bg-emerald-700",
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
      {/* Backdrop blur */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
          <h2 className={`text-lg font-black tracking-tight ${cfg.color}`}>
            {cfg.titulo}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-lg space-y-1">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Detalle del Cheque
            </p>
            <p className="text-sm font-semibold text-gray-800">
              Banco {cheque.banco} - N° {cheque.numero}
            </p>
            <p className="text-lg font-black text-gray-900">
              {formatPrice(cheque.importe)}
            </p>
          </div>

          {accion === "RECHAZAR" ? (
            <div className="flex items-center gap-3 text-sm font-medium text-rose-700 bg-rose-50 p-4 rounded-lg border border-rose-100">
              <AlertTriangle size={20} className="shrink-0" />
              ¿Está seguro que desea marcar este cheque como RECHAZADO? Esta
              acción no se puede deshacer.
            </div>
          ) : (
            <form
              id="accion-cheque-form"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                  Cuenta Destino
                </label>
                <SearchableSelect
                  options={cuentaOptions}
                  value={String(codigoCuentaDestino)}
                  onChange={(e) => setCodigoCuentaDestino(e.target.value)}
                  onSearchChange={setBusqueda}
                  placeholder={isLoadingBancos ? "Cargando bancos..." : "Seleccione una cuenta"}
                  disabled={isLoadingBancos && !bancos}
                />
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="accion-cheque-form"
            onClick={accion === "RECHAZAR" ? handleSubmit : undefined}
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

export default ModalDestinoCheque;
