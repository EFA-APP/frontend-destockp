import { X } from "lucide-react";

// Bugfix (reportado por el humano): el botón "Revisar Saldo" de la tabla
// de Revisión no hacía nada (span sin onClick). Muestra el detalle del
// cálculo de la fila con saldo a favor (no se factura, R28 del backend:
// diferencia <= 0).
const ModalDetalleSaldo = ({ fila, onClose }) => {
  if (!fila) return null;

  const fmt = (n) =>
    (n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-black tracking-tight text-gray-800">
            Detalle de Saldo a Favor
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="rounded-md border border-blue-100 bg-blue-50/50 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-semibold text-gray-500">Paciente</span>
              <span className="font-bold text-gray-900">
                {fila.nombre || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-semibold text-gray-500">Documento</span>
              <span className="font-bold text-gray-900">
                {fila.documento || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-semibold text-gray-500">Plan</span>
              <span className="font-bold text-gray-900">
                {fila.plan || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-semibold text-gray-500">Cliente ID</span>
              <span className="font-bold text-gray-900">
                {fila.id_cliente || "-"}
              </span>
            </div>
            <div className="h-px bg-blue-100 my-1" />
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-semibold text-gray-500">
                Base de Cálculo
              </span>
              <span className="font-bold text-gray-900">
                ${fmt(fila.base_calculo)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-semibold text-gray-500">Aporte</span>
              <span className="font-bold text-gray-900">
                ${fmt(fila.aporte)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-semibold text-gray-500">Diferencia</span>
              <span className="font-bold text-gray-900">
                ${fmt(fila.diferencia)}
              </span>
            </div>
            <div className="h-px bg-blue-100 my-1" />
            <div className="flex items-center justify-between text-[15px]">
              <span className="font-black text-blue-700">Saldo a Favor</span>
              <span className="font-black text-blue-700">
                ${fmt(fila.saldo_a_favor)}
              </span>
            </div>
          </div>

          <p className="text-[12px] font-semibold text-gray-400">
            Este afiliado no se factura en esta importación: la diferencia es
            negativa o cero, así que queda como saldo a favor en lugar de
            generar una Factura.
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleSaldo;
