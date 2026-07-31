import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLoteCuotas } from "../../../../Backend/Escuela/hooks/useLoteCuotas";
import { reintentarLoteCuotasApi } from "../../../../Backend/Escuela/api/cuotas.api";
import { RefreshCw, X } from "lucide-react";

const ETIQUETAS_ESTADO = {
  EXITO: {
    label: "Éxito",
    clase: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    dot: "bg-emerald-500",
  },
  ERROR: {
    label: "Error",
    clase: "bg-rose-50 text-rose-700 border-rose-200/60",
    dot: "bg-rose-500",
  },
  OMITIDO: {
    label: "Ya emitida",
    clase: "bg-amber-50 text-amber-700 border-amber-200/60",
    dot: "bg-amber-500",
  },
  PENDIENTE: {
    label: "Pendiente",
    clase: "bg-gray-50 text-gray-600 border-gray-200/60",
    dot: "bg-gray-400",
  },
};

/**
 * Polling de progreso de un `LoteEmisionCuotas` (R47, R103): muestra el
 * estado agregado del lote y el detalle por ítem (EXITO/ERROR/OMITIDO/
 * PENDIENTE), con opción de reintentar solo los `ERROR`.
 */
const ModalProgresoLoteCuotas = ({ codigoLote, onClose, onFinalizado }) => {
  const queryClient = useQueryClient();
  const { lote, cargandoLote } = useLoteCuotas(codigoLote);
  const [reintentando, setReintentando] = useState(false);
  const [errorReintento, setErrorReintento] = useState("");

  const items = lote?.items ?? [];
  const totales = items.reduce(
    (acc, item) => {
      acc[item.estado] = (acc[item.estado] ?? 0) + 1;
      return acc;
    },
    { PENDIENTE: 0, EXITO: 0, ERROR: 0, OMITIDO: 0 },
  );
  const finalizado = lote?.estado === "FINALIZADO";
  const hayErrores = totales.ERROR > 0;

  const handleReintentar = async () => {
    setReintentando(true);
    setErrorReintento("");
    try {
      await reintentarLoteCuotasApi(codigoLote);
      queryClient.invalidateQueries({ queryKey: ["lote-cuotas", codigoLote] });
      queryClient.invalidateQueries({ queryKey: ["deuda-alumno"] });
      queryClient.invalidateQueries({ queryKey: ["deudas-cobro-cuota"] });
    } catch (err) {
      setErrorReintento(
        err?.response?.data?.message ||
          "Error al reintentar los ítems fallidos.",
      );
    } finally {
      setReintentando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[85vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-black tracking-tight text-gray-800">
              Emisión de cuotas — Lote #{codigoLote}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              {finalizado
                ? "Procesamiento finalizado"
                : "Procesando en segundo plano..."}
            </p>
          </div>
          <button
            onClick={() => {
              if (finalizado) onFinalizado?.();
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-4 gap-3">
            {[
              ["PENDIENTE", "Pendientes"],
              ["EXITO", "Éxito"],
              ["ERROR", "Error"],
              ["OMITIDO", "Ya emitidas"],
            ].map(([key, label]) => (
              <div
                key={key}
                className={`rounded-md border p-4 flex flex-col gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${ETIQUETAS_ESTADO[key].clase}`}
              >
                <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${ETIQUETAS_ESTADO[key].dot}`}
                  />
                  {label}
                </span>
                <span className="text-2xl font-black tracking-tight leading-none mt-1">
                  {totales[key] ?? 0}
                </span>
              </div>
            ))}
          </div>

          {cargandoLote && !lote ? (
            <div className="flex flex-col gap-2 py-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-100 rounded-md animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 border border-gray-200 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <table className="w-full border-collapse text-left">
                <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Contacto
                    </th>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                      Monto
                    </th>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                      Estado
                    </th>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Motivo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {items.map((item) => (
                    <tr
                      key={item.codigo}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-5 py-4 text-[11px] font-black text-gray-900 uppercase tracking-widest">
                        Contacto #{item.codigoContacto}
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-right text-gray-600">
                        {item.monto}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${ETIQUETAS_ESTADO[item.estado]?.clase ?? ""}`}
                        >
                          {ETIQUETAS_ESTADO[item.estado] && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${ETIQUETAS_ESTADO[item.estado].dot}`}
                            />
                          )}
                          {ETIQUETAS_ESTADO[item.estado]?.label ?? item.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[11px] text-rose-600 font-semibold">
                        {item.motivoError ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {errorReintento && (
            <p className="text-rose-600 text-[11px] font-bold bg-rose-50 border border-rose-100 rounded-md p-2">
              {errorReintento}
            </p>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-xl">
          {finalizado && hayErrores && (
            <button
              onClick={handleReintentar}
              disabled={reintentando}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors cursor-pointer"
            >
              <RefreshCw
                size={14}
                className={reintentando ? "animate-spin" : ""}
              />
              Reintentar fallidos
            </button>
          )}
          <button
            onClick={() => {
              if (finalizado) onFinalizado?.();
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-md shadow-sm bg-[#1FAE6D] hover:bg-[#178F58] transition-all cursor-pointer"
          >
            {finalizado ? "Cerrar panel" : "Seguir en segundo plano"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProgresoLoteCuotas;
