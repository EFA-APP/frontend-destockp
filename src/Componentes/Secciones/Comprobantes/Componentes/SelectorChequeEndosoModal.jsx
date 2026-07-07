import { useState } from "react";
import { X, Search, FileText, CheckCircle } from "lucide-react";
import { useChequeTerceroDisponiblesQuery } from "../../../../Backend/Comprobantes/queries/useChequeTerceroDisponiblesQuery";
import { formatPrice } from "../../../../utils/formatters";

const SelectorChequeEndosoModal = ({ onClose, onConfirm }) => {
  const [busqueda, setBusqueda] = useState("");
  const [chequeSeleccionado, setChequeSeleccionado] = useState(null);
  
  const [endoso, setEndoso] = useState({
    cuitEndosado: "",
    receptorEndosado: "",
    fechaEndoso: new Date().toISOString().split("T")[0],
  });

  const { data: chequesData, isLoading } = useChequeTerceroDisponiblesQuery(busqueda);
  const cheques = Array.isArray(chequesData) ? chequesData : (chequesData?.data || []);

  const handleConfirm = () => {
    if (!chequeSeleccionado) return;
    if (!endoso.cuitEndosado || !endoso.receptorEndosado || !endoso.fechaEndoso) return;

    onConfirm({
      codigoChequeTercero: chequeSeleccionado.codigo,
      fechaEndoso: endoso.fechaEndoso,
      cuitEndosado: endoso.cuitEndosado,
      receptorEndosado: endoso.receptorEndosado,
      _chequeOriginal: chequeSeleccionado, // Para UI
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white border border-[var(--border-subtle)] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-amber-600" size={20} />
            <h2 className="text-lg font-black tracking-tight text-amber-900 uppercase">
              Seleccionar Cheque para Endoso
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar cheque disponible..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm font-medium focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[200px]">
          {isLoading ? (
            <p className="text-center text-gray-500 font-semibold py-8 text-sm">Cargando cheques...</p>
          ) : cheques.length === 0 ? (
            <p className="text-center text-gray-500 font-semibold py-8 text-sm">No hay cheques disponibles para endoso.</p>
          ) : (
            cheques.map((ch) => (
              <div
                key={ch.codigo}
                onClick={() => setChequeSeleccionado(ch)}
                className={`p-3 border rounded-md cursor-pointer transition-all ${
                  chequeSeleccionado?.codigo === ch.codigo
                    ? "border-amber-500 bg-amber-50 shadow-sm"
                    : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/30"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{ch.banco} - #{ch.numero}</p>
                    <p className="text-xs text-gray-500">Titular: {ch.titular} (CUIT: {ch.cuit})</p>
                  </div>
                  <p className="text-base font-black text-emerald-700">{formatPrice(ch.importe)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {chequeSeleccionado && (
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Datos del Endosatario</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">CUIT Endosado</label>
                <input
                  type="text"
                  value={endoso.cuitEndosado}
                  onChange={(e) => setEndoso((p) => ({ ...p, cuitEndosado: e.target.value }))}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:border-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Receptor (Nombre)</label>
                <input
                  type="text"
                  value={endoso.receptorEndosado}
                  onChange={(e) => setEndoso((p) => ({ ...p, receptorEndosado: e.target.value }))}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:border-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Fecha Endoso</label>
                <input
                  type="date"
                  value={endoso.fechaEndoso}
                  onChange={(e) => setEndoso((p) => ({ ...p, fechaEndoso: e.target.value }))}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:border-amber-400 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!chequeSeleccionado || !endoso.cuitEndosado || !endoso.receptorEndosado}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirmar Endoso <CheckCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectorChequeEndosoModal;
