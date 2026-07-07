import { useState } from "react";
import ModalDetalleBase from "../../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../../UI/ModalDetalleBase/ModalDetalle";
import { BilleteraIcono } from "../../../../assets/Icons";
import { formatPrice } from "../../../../utils/formatters";
import { BILLETES, MONEDAS } from "./utils/denominaciones";

const FieldLabel = ({ children }) => (
  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">
    {children}
  </span>
);

// Claves compuestas ("billete-10"/"moneda-10") para evitar colisión entre
// denominaciones de igual valor numérico presentes en BILLETES y MONEDAS
// (design.md §5).
const claveBillete = (valor) => `billete-${valor}`;
const claveMoneda = (valor) => `moneda-${valor}`;

const denominacionDesdeClave = (clave) => {
  const [, valor] = clave.split("-");
  return Number(valor);
};

const ModalCierreCaja = ({ saldoTeorico, onConfirmar, onClose }) => {
  const [conteo, setConteo] = useState({});

  const cambiarCantidad = (clave, cantidad) => {
    setConteo((prev) => ({ ...prev, [clave]: cantidad }));
  };

  const totalContado = Object.entries(conteo).reduce(
    (acc, [clave, cantidad]) =>
      acc + denominacionDesdeClave(clave) * (Number(cantidad) || 0),
    0,
  );

  const diferencia = totalContado - saldoTeorico;

  const colorDiferencia =
    diferencia === 0
      ? "text-emerald-600"
      : diferencia < 0
        ? "text-rose-600"
        : "text-amber-600";

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onConfirmar({ totalContado, diferencia, detalleConteo: conteo });
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
    <div className="space-y-5 py-2 px-1">
      <div>
        <FieldLabel>Billetes</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          {BILLETES.map((valor) => {
            const clave = claveBillete(valor);
            return (
              <label key={clave} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 w-16 shrink-0">
                  {formatPrice(valor)}
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={conteo[clave] ?? ""}
                  onChange={(e) => cambiarCantidad(clave, e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] focus:bg-white transition-all"
                />
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <FieldLabel>Monedas</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          {MONEDAS.map((valor) => {
            const clave = claveMoneda(valor);
            return (
              <label key={clave} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 w-16 shrink-0">
                  {formatPrice(valor)}
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={conteo[clave] ?? ""}
                  onChange={(e) => cambiarCantidad(clave, e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] focus:bg-white transition-all"
                />
              </label>
            );
          })}
        </div>
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
    </div>
  );

  return (
    <ModalDetalleBase open onClose={onClose} width="max-w-[520px]">
      <ModalDetalle
        title="Cierre de Caja — Arqueo"
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
