import { X, History } from "lucide-react";
import { useHistorialChequeTerceroQuery } from "../../../../Backend/Comprobantes/queries/useHistorialChequeTerceroQuery";
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

const ModalHistorialCheque = ({ cheque, onClose }) => {
  const { data, isLoading } = useHistorialChequeTerceroQuery(cheque.codigo);
  const movimientos = data?.movimientos ?? [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-md shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[85vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50 rounded-t-md">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
            <History size={16} />
            Historial del Cheque
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
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

          {isLoading ? (
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center py-8">
              Cargando historial...
            </p>
          ) : movimientos.length === 0 ? (
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center py-8">
              Sin movimientos registrados.
            </p>
          ) : (
            <div className="px-2">
              <ol className="relative border-l-2 border-gray-200 space-y-6 pl-5">
                {movimientos.map((mov) => (
                  <li key={mov.codigo} className="relative">
                    <span className="absolute -left-[27px] flex items-center justify-center w-3 h-3 bg-gray-200 rounded-full ring-4 ring-white" />
                    <div className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-1">
                      {mov.estadoAnterior
                        ? `${mov.estadoAnterior.replace(/_/g, " ")} → ${mov.estadoNuevo.replace(/_/g, " ")}`
                        : `Alta — ${mov.estadoNuevo.replace(/_/g, " ")}`}
                    </div>
                    <div className="text-xs text-gray-500 font-bold mb-1">
                      {fmtFechaHora(mov.fecha)}
                      {mov.codigoUsuario ? <span className="text-gray-400 font-mono ml-2">USR_{mov.codigoUsuario}</span> : ""}
                    </div>
                    {mov.observaciones && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md border border-gray-200 mt-2">
                        {mov.observaciones}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end rounded-b-md">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors uppercase tracking-wider"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalHistorialCheque;
