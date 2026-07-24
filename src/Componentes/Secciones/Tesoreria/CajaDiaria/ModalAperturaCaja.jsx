import { useState } from "react";
import ModalDetalleBase from "../../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../../UI/ModalDetalleBase/ModalDetalle";
import { Unlock } from "lucide-react";

const FieldLabel = ({ children }) => (
  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-2">
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
        className="flex items-center gap-2 px-6 py-2.5 bg-[#1FAE6D] hover:bg-[#178F58] text-white rounded-md text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
      >
        Confirmar Apertura
      </button>
    </div>
  );

  const content = (
    <div className="space-y-6 py-4 px-2">
      <div>
        <FieldLabel>Fondo inicial (Efectivo Físico)</FieldLabel>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
            $
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
            className="w-full bg-white border border-gray-300 rounded-md pl-9 pr-4 py-3 text-lg font-black text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all placeholder:font-medium placeholder:text-gray-300"
            autoFocus
          />
        </div>
        {error && (
          <p className="text-[11px] font-bold text-rose-500 mt-2 ml-1">
            {error}
          </p>
        )}
      </div>
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-[12px] font-medium text-gray-500 leading-relaxed">
          Ingresá el monto de dinero físico con el que comienza el día la caja. Este monto servirá de base para el arqueo final al momento del cierre.
        </p>
      </div>
    </div>
  );

  return (
    <ModalDetalleBase open onClose={onClose} width="max-w-[420px]">
      <ModalDetalle
        title="Apertura de Caja"
        icon={<Unlock size={20} />}
        onClose={onClose}
        footer={footer}
      >
        {content}
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalAperturaCaja;
