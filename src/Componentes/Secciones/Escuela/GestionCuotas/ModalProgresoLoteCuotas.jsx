import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLoteCuotas } from "../../../../Backend/Escuela/hooks/useLoteCuotas";
import { reintentarLoteCuotasApi } from "../../../../Backend/Escuela/api/cuotas.api";
import { RefreshCw } from "lucide-react";

const ETIQUETAS_ESTADO = {
  EXITO: { label: "Éxito", clase: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  ERROR: { label: "Error", clase: "bg-rose-100 text-rose-700 border-rose-200" },
  OMITIDO: { label: "Ya emitida", clase: "bg-amber-100 text-amber-700 border-amber-200" },
  PENDIENTE: { label: "Pendiente", clase: "bg-gray-100 text-gray-500 border-gray-200" },
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
    } catch (err) {
      setErrorReintento(err?.response?.data?.message || "Error al reintentar los ítems fallidos.");
    } finally {
      setReintentando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-[var(--border-subtle)] rounded-xl max-w-2xl w-full p-7 shadow-2xl flex flex-col gap-5 max-h-[85vh]">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black tracking-tight text-gray-800">
            Emisión de cuotas — Lote #{codigoLote}
          </h2>
          <p className="text-xs font-semibold text-gray-500">
            {finalizado
              ? "Procesamiento finalizado."
              : "Procesando en segundo plano, esta ventana se actualiza sola..."}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            ["PENDIENTE", "Pendientes"],
            ["EXITO", "Éxito"],
            ["ERROR", "Error"],
            ["OMITIDO", "Ya emitidas"],
          ].map(([key, label]) => (
            <div
              key={key}
              className={`rounded-md border p-3 flex flex-col gap-1 ${ETIQUETAS_ESTADO[key].clase}`}
            >
              <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
              <span className="text-xl font-black">{totales[key] ?? 0}</span>
            </div>
          ))}
        </div>

        {cargandoLote && !lote ? (
          <div className="flex flex-col gap-2 py-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-md animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 border border-[var(--border-subtle)] rounded-lg">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-50/80 sticky top-0 border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Contacto
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                    Monto
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                    Estado
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Motivo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {items.map((item) => (
                  <tr key={item.codigo} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2 text-xs font-bold text-gray-700">
                      Contacto #{item.codigoContacto}
                    </td>
                    <td className="px-4 py-2 text-xs font-semibold text-right text-gray-600">
                      {item.monto}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${ETIQUETAS_ESTADO[item.estado]?.clase ?? ""}`}
                      >
                        {ETIQUETAS_ESTADO[item.estado]?.label ?? item.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[11px] text-rose-600 font-semibold">
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

        <div className="flex gap-3 justify-end pt-1">
          {finalizado && hayErrores && (
            <button
              onClick={handleReintentar}
              disabled={reintentando}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100 disabled:opacity-50 transition-all cursor-pointer"
            >
              <RefreshCw size={14} className={reintentando ? "animate-spin" : ""} />
              Reintentar fallidos
            </button>
          )}
          <button
            onClick={() => {
              if (finalizado) onFinalizado?.();
              onClose();
            }}
            className="px-5 py-2.5 rounded-md bg-[var(--primary)] text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-md shadow-[var(--primary)]/20"
          >
            {finalizado ? "Cerrar" : "Seguir en segundo plano"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProgresoLoteCuotas;
