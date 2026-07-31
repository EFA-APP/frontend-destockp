import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { aplicarSaldoAFavorApi } from "../../../../Backend/Ventas/api/Comprobante/comprobante.api";
import { useAlertas } from "../../../../store/useAlertas";

export const ModalAplicarSaldoAFavor = ({
  open,
  onClose,
  factura,
  comprobantesAFavor,
  onSuccess,
}) => {
  const [selectedNc, setSelectedNc] = useState(null);
  const [loading, setLoading] = useState(false);
  const { agregarAlerta } = useAlertas();

  if (!open) return null;

  const handleApply = async () => {
    if (!selectedNc) return;
    setLoading(true);
    try {
      const importeAplicado = Math.min(
        factura.saldoPendiente,
        selectedNc.montoDisponible,
      );
      await aplicarSaldoAFavorApi({
        codigoNC: selectedNc.codigo,
        codigoFactura: factura.codigo,
        importeAplicado: importeAplicado,
      });
      agregarAlerta({
        type: "success",
        message: "Saldo aplicado correctamente",
      });
      onSuccess?.();
    } catch (e) {
      agregarAlerta({
        type: "error",
        message: e?.response?.data?.message || "No se pudo aplicar el saldo",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (monto) => {
    return Number(monto || 0).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Aplicar Saldo a Favor
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Selecciona una nota de crédito para descontar saldo a esta
              factura.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-3">
            <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <span className="font-bold">Factura actual:</span> Saldo pendiente{" "}
              {formatearMoneda(factura.saldoPendiente)}
            </div>
          </div>

          <div className="space-y-3">
            {comprobantesAFavor.map((nc) => {
              const isSelected = selectedNc?.codigo === nc.codigo;
              return (
                <div
                  key={nc.codigo}
                  onClick={() => setSelectedNc(nc)}
                  className={`p-3 border rounded-md cursor-pointer transition-all ${
                    isSelected
                      ? "border-brand-primary bg-brand-soft ring-1 ring-brand-primary/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 uppercase">
                        {nc.tipoDescripcionComprobante}{" "}
                        {String(nc.puntoVenta).padStart(5, "0")}-
                        {String(nc.numeroComprobante).padStart(8, "0")}
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {new Date(nc.fechaEmision).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-0.5 uppercase tracking-wider font-bold">
                        Disponible
                      </p>
                      <p className="text-sm font-black text-green-600 font-mono">
                        {formatearMoneda(nc.montoDisponible)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedNc || loading}
            className="px-4 py-2 text-sm font-bold bg-[var(--color-brand-primary)] text-white rounded-md hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading ? (
              "Aplicando..."
            ) : (
              <>
                <CheckCircle size={16} />
                Confirmar
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
