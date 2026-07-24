import { useState } from "react";
import ModalDetalleBase from "../../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../../UI/ModalDetalleBase/ModalDetalle";
import { Lock } from "lucide-react";
import { formatPrice } from "../../../../utils/formatters";

const FieldLabel = ({ children }) => (
  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-2">
    {children}
  </span>
);

const ModalCierreCaja = ({ saldoTeorico, onConfirmar, onClose }) => {
  const [montoContadoStr, setMontoContadoStr] = useState("");

  const totalContado = Number(montoContadoStr) || 0;
  const diferencia = totalContado - saldoTeorico;

  const colorDiferencia =
    diferencia === 0
      ? "text-[#1FAE6D]"
      : diferencia < 0
        ? "text-rose-600"
        : "text-amber-600";

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onConfirmar({ saldoContadoFinal: totalContado, detalleDenominaciones: {} });
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full pt-4 border-t border-gray-200 mt-2">
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors uppercase tracking-wider"
      >
        Cancelar
      </button>
      <button
        onClick={handleSubmit}
        className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-md text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
      >
        Confirmar Cierre
      </button>
    </div>
  );

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6 py-4 px-2">
      <div>
        <FieldLabel>Efectivo Físico Contado</FieldLabel>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
            $
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={montoContadoStr}
            onChange={(e) => setMontoContadoStr(e.target.value)}
            placeholder="0.00"
            className="w-full bg-white border border-gray-300 rounded-md pl-9 pr-4 py-3 text-2xl font-black text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all placeholder:font-medium placeholder:text-gray-300"
            autoFocus
          />
        </div>
        <p className="text-[11px] font-bold text-gray-400 mt-2 px-1">
          Ingrese la suma total del efectivo físico presente en la caja.
        </p>
      </div>

      <div className="border border-gray-200 rounded-md bg-gray-50/50 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Saldo teórico esperado
          </span>
          <span className="text-sm font-black text-gray-800 tabular-nums">
            {formatPrice(saldoTeorico)}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Total contado (Real)
          </span>
          <span className="text-sm font-black text-gray-900 tabular-nums">
            {formatPrice(totalContado)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Diferencia (Arqueo)
          </span>
          <span className={`text-base font-black tabular-nums tracking-tight ${colorDiferencia}`}>
            {diferencia > 0 ? "+" : ""}{formatPrice(diferencia)}
          </span>
        </div>
      </div>
    </form>
  );

  return (
    <ModalDetalleBase open onClose={onClose} width="max-w-[420px]">
      <ModalDetalle
        title="Cierre de Caja"
        icon={<Lock size={20} />}
        onClose={onClose}
        footer={footer}
      >
        {content}
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalCierreCaja;
