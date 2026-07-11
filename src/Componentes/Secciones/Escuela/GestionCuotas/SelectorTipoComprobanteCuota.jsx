import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { usePermisosDeUsuario } from "../../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";
import { COMPROBANTES_METADATA } from "../../../UI/Select/SelectorTipoComprobante";

/**
 * Selector explícito de tipo de comprobante para la emisión de cuotas
 * (bugfix/mejora puntual pedida por el usuario 2026-07-11, ver
 * progress/impl_cuotas-selector-tipo-comprobante.md). La emisión de cuota
 * SIEMPRE es una "Factura" (Interna 991 o fiscal A/1, B/6, C/11) — nunca
 * Nota de Crédito/Débito, Recibo ni Orden de Pago, a diferencia del
 * selector genérico `SelectorTipoComprobante.jsx` (que cubre TODO el
 * catálogo). Se reutiliza `COMPROBANTES_METADATA` (mismo catálogo, mismo
 * origen de verdad que ese selector y que `CabeceraComprobante.jsx`) para
 * no duplicar labels/colores, y el mismo criterio `tieneAccion(item.permission)`
 * que usa `TieneAccion.jsx`, acotado a este subconjunto de 4 ids.
 */
const IDS_FACTURA_CUOTA = [991, 1, 6, 11];

/**
 * Lista de tipos de comprobante "Factura" que el usuario actual tiene
 * permitidos (filtrado real por `tieneAccion`, no solo UI decorativa).
 * Expuesto como hook aparte para que los modales puedan precargar el
 * primer permitido y gatear el botón de emitir sin necesidad de montar
 * el `<select>`.
 */
export const useTiposComprobanteCuotaPermitidos = () => {
  const { tieneAccion } = usePermisosDeUsuario();

  return useMemo(
    () =>
      IDS_FACTURA_CUOTA.map((id) =>
        COMPROBANTES_METADATA.find((item) => item.id === id),
      ).filter((item) => item && tieneAccion(item.permission)),
    [tieneAccion],
  );
};

const SelectorTipoComprobanteCuota = ({
  value,
  onChange,
  disabled = false,
  className = "",
}) => {
  const opciones = useTiposComprobanteCuotaPermitidos();

  if (opciones.length === 0) {
    return (
      <div
        className={`flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-md px-3 py-2.5 text-xs font-bold text-rose-700 ${className}`}
      >
        <AlertTriangle size={16} className="shrink-0" />
        No tenés permiso para emitir ningún tipo de Factura (Interna, A, B ni
        C). Contactá a un administrador.
      </div>
    );
  }

  const seleccionada = opciones.find((op) => op.id === Number(value));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="flex-1 bg-white border border-[var(--border-subtle)] rounded-md px-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all disabled:opacity-50 disabled:bg-gray-50"
      >
        {opciones.map((op) => (
          <option key={op.id} value={op.id}>
            {op.label}
          </option>
        ))}
      </select>
      {seleccionada && (
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-2 py-1.5 rounded shrink-0 ${
            seleccionada.tipo === "FISCAL"
              ? "bg-blue-50 text-blue-600 border border-blue-200"
              : "bg-gray-100 text-gray-500 border border-gray-200"
          }`}
        >
          {seleccionada.tipo === "FISCAL" ? "Fiscal" : "Interno"}
        </span>
      )}
    </div>
  );
};

export default SelectorTipoComprobanteCuota;
