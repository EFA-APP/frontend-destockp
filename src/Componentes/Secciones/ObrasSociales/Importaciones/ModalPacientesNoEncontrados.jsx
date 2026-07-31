import { X } from "lucide-react";

const ModalPacientesNoEncontrados = ({
  noEncontradas,
  decisionesCrear,
  toggleDecisionCrear,
  marcarTodos,
  todosMarcados,
  cantidadAFacturar,
  cantidadAOmitir,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-black tracking-tight text-gray-800">
            Pacientes no encontrados ({noEncontradas.length})
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => marcarTodos(!todosMarcados)}
              className="text-[11px] font-bold uppercase tracking-widest text-amber-800 bg-white border border-amber-300 rounded-md px-3 py-1.5 hover:bg-amber-100 transition-colors"
            >
              {todosMarcados ? "Desmarcar todos" : "Marcar todos"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="max-h-[60vh] overflow-y-auto rounded-md border border-amber-200 bg-white">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-amber-100">
                  <th className="px-4 py-2 text-[11px] font-black uppercase text-amber-800">
                    Paciente
                  </th>
                  <th className="px-4 py-2 text-[11px] font-black uppercase text-amber-800">
                    Documento
                  </th>
                  <th className="px-4 py-2 text-[11px] font-black uppercase text-amber-800">
                    Monto a facturar
                  </th>
                  <th className="px-4 py-2 text-[11px] font-black uppercase text-amber-800 text-right">
                    Crear como Cliente nuevo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {noEncontradas.map((f) => (
                  <tr key={f.id_cliente}>
                    <td className="px-4 py-3 text-[14px] font-bold text-gray-900">
                      {f.nombre || "-"}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-gray-500">
                      {f.documento || "-"}
                    </td>
                    <td className="px-4 py-3 text-[14px] font-black text-gray-900">
                      $
                      {(f.total_facturar || 0).toLocaleString("es-AR", {
                        minimumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="checkbox"
                        checked={!!decisionesCrear[f.id_cliente]}
                        onChange={() => toggleDecisionCrear(f.id_cliente)}
                        className="w-4 h-4 accent-[#48C479] cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[13px] font-bold text-amber-800">
            {cantidadAFacturar} se facturarán, {cantidadAOmitir} quedarán
            omitidas
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-white rounded-md shadow-sm bg-[#1FAE6D] hover:bg-[#178F58] transition-all cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPacientesNoEncontrados;
