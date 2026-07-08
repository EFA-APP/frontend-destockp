import { useState } from "react";
import ModalDetalleBase from "../../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../../UI/ModalDetalleBase/ModalDetalle";
import { BilleteraIcono } from "../../../../assets/Icons";
import { formatPrice } from "../../../../utils/formatters";

const FieldLabel = ({ children }) => (
  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">
    {children}
  </span>
);

const ModalCierreCaja = ({ saldoTeorico, onConfirmar, onClose }) => {
  const [montoContadoStr, setMontoContadoStr] = useState("");

  const totalContado = Number(montoContadoStr) || 0;
  const diferencia = totalContado - saldoTeorico;

  const colorDiferencia =
    diferencia === 0
      ? "text-emerald-600"
      : diferencia < 0
        ? "text-rose-600"
        : "text-amber-600";

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onConfirmar({ saldoContadoFinal: totalContado, detalleDenominaciones: {} });
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full pt-2">
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
      >
        Cancelar
      </button>
      <button
        onClick={handleSubmit}
        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:opacity-90 text-white rounded-xl font-bold shadow-lg shadow-[var(--primary)]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
      >
        Confirmar Cierre
      </button>
    </div>
  );

  const content = (
    <form onSubmit={handleSubmit} className="space-y-5 py-2 px-1">
      <div>
        <FieldLabel>Efectivo Físico Contado</FieldLabel>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
            $
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={montoContadoStr}
            onChange={(e) => setMontoContadoStr(e.target.value)}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] focus:bg-white transition-all placeholder:font-medium placeholder:text-slate-300"
            autoFocus
          />
        </div>
        <p className="text-[11px] font-bold text-slate-400 mt-2 px-1">
          Ingrese la suma total del efectivo físico presente en la caja.
        </p>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Saldo teórico esperado
          </span>
          <span className="text-sm font-black text-slate-700">
            {formatPrice(saldoTeorico)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Total contado
          </span>
          <span className="text-sm font-black text-slate-700">
            {formatPrice(totalContado)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Diferencia
          </span>
          <span className={`text-sm font-black ${colorDiferencia}`}>
            {formatPrice(diferencia)}
          </span>
        </div>
      </div>
    </form>
  );

  return (
    <ModalDetalleBase open onClose={onClose} width="max-w-[420px]">
      <ModalDetalle
        title="Cierre de Caja"
        icon={<BilleteraIcono size={20} />}
        onClose={onClose}
        footer={footer}
      >
        {content}
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalCierreCaja;
