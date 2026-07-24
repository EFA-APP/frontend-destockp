import { X, History } from "lucide-react";
import { useHistorialChequePropioQuery } from "../../../../Backend/Comprobantes/queries/useHistorialChequePropioQuery";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { formatPrice } from "../../../../utils/formatters";

const fmtFechaHora = (iso) =>
  iso
    ? new Date(iso).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// Feature "bancos" (T47, T49, R60, R61, R73): historial de auditoría
// completo de un cheque propio, mismo patrón que
// ChequeTercero/ModalHistorialCheque.jsx.
const ModalHistorialChequePropio = ({ cheque, onClose }) => {
  const { usuario } = useAuthStore();
  const { data, isLoading } = useHistorialChequePropioQuery(cheque.codigo, usuario?.codigoEmpresa);
  const movimientos = data?.movimientos ?? [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[85vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-black tracking-tight text-gray-800 flex items-center gap-2">
            <History size={18} />
            Historial del Cheque
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg space-y-1">
            <p className="text-sm font-semibold text-gray-800">
              Banco {cheque.banco} - N° {cheque.numero}
            </p>
            <p className="text-lg font-black text-gray-900">{formatPrice(cheque.importe)}</p>
          </div>

          {isLoading ? (
            <p className="text-sm font-semibold text-black/40 text-center py-8">Cargando historial...</p>
          ) : movimientos.length === 0 ? (
            <p className="text-sm font-semibold text-black/40 text-center py-8">Sin movimientos registrados.</p>
          ) : (
            <ol className="relative border-l-2 border-gray-100 space-y-5 pl-4">
              {movimientos.map((mov) => (
                <li key={mov.codigo} className="space-y-0.5">
                  <div className="text-xs font-black text-gray-800 uppercase tracking-wide">
                    {mov.estadoAnterior
                      ? `${mov.estadoAnterior.replace(/_/g, " ")} → ${mov.estadoNuevo.replace(/_/g, " ")}`
                      : `Alta — ${mov.estadoNuevo.replace(/_/g, " ")}`}
                  </div>
                  <div className="text-[11px] text-gray-500 font-semibold">
                    {fmtFechaHora(mov.fecha)}
                    {mov.codigoUsuario ? ` · Usuario ${mov.codigoUsuario}` : ""}
                  </div>
                  {mov.observaciones && (
                    <div className="text-[11px] text-gray-400 italic">{mov.observaciones}</div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalHistorialChequePropio;
