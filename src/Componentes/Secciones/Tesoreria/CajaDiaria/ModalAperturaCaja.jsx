import { useState } from "react";
import ModalDetalleBase from "../../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../../UI/ModalDetalleBase/ModalDetalle";
import { BilleteraIcono } from "../../../../assets/Icons";

const FieldLabel = ({ children }) => (
  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">
    {children}
  </span>
);

const ModalAperturaCaja = ({ onConfirmar, onClose }) => {
  const [monto, setMonto] = useState("");
  const [error, setError] = useState("");

  const validar = () => {
    const montoNumerico = Number(monto);
    if (monto === "" || isNaN(montoNumerico) || montoNumerico < 0) {
      setError("El fondo inicial debe ser un monto numérico mayor o igual a 0.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validar()) return;
    onConfirmar(Number(monto));
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
        Abrir Caja
      </button>
    </div>
  );

  const content = (
    <div className="space-y-5 py-2 px-1">
      <div>
        <FieldLabel>Fondo inicial</FieldLabel>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
            $
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] focus:bg-white transition-all"
          />
        </div>
        {error && (
          <p className="text-[11px] font-bold text-rose-500 mt-1.5 ml-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <ModalDetalleBase open onClose={onClose}>
      <ModalDetalle
        title="Apertura de Caja"
        icon={<BilleteraIcono size={20} />}
        onClose={onClose}
        footer={footer}
      >
        {content}
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalAperturaCaja;
