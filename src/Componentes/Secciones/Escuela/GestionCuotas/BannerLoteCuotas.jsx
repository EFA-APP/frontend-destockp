import { Loader2, Eye, X, CheckCircle2 } from "lucide-react";

/**
 * Banner persistente (no bloqueante) del lote de emisión masiva más
 * reciente del scope exacto (cuenta contable + UN + período) seleccionado
 * en `GestionCuotas.jsx`. Resuelve que el progreso/resultado de "Generar
 * cuotas para todos" se pierda al cambiar de sección: la fuente de verdad
 * es siempre `cuotas.lotes.listar`/`cuotas.lotes.obtener` contra el
 * backend (ver `useUltimoLoteCuotas`), nunca estado local perdido al
 * desmontar un modal.
 *
 * - `EN_PROCESO`: banner fijo (sin botón de descartar), con progreso
 *   X/Y y acceso al detalle en vivo.
 * - `FINALIZADO`: banner liviano y dismissible con el resumen de
 *   éxitos/errores.
 */
const BannerLoteCuotas = ({ lote, onVerDetalle, onDescartar }) => {
  if (!lote) return null;

  const items = lote.items ?? [];
  const totales = items.reduce(
    (acc, item) => {
      acc[item.estado] = (acc[item.estado] ?? 0) + 1;
      return acc;
    },
    { PENDIENTE: 0, EXITO: 0, ERROR: 0, OMITIDO: 0 },
  );
  const total = items.length;
  const procesados = total - totales.PENDIENTE;

  if (lote.estado === "EN_PROCESO") {
    return (
      <div className="flex items-center justify-between gap-3 bg-sky-50 border border-sky-200 rounded-md px-4 py-3">
        <div className="flex items-center gap-3">
          <Loader2 size={16} className="text-sky-600 animate-spin shrink-0" />
          <p className="text-[12px] font-bold text-sky-800">
            Emisión en curso — Lote #{lote.codigo}: {procesados}/{total} procesados
          </p>
        </div>
        <button
          onClick={onVerDetalle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer shrink-0"
        >
          <Eye size={12} />
          Ver progreso
        </button>
      </div>
    );
  }

  if (lote.estado === "FINALIZADO") {
    return (
      <div className="flex items-center justify-between gap-3 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md px-4 py-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <p className="text-[12px] font-bold text-[var(--text-secondary)]">
            Última emisión — Lote #{lote.codigo}: {totales.EXITO} éxitos, {totales.ERROR} errores
            {totales.OMITIDO > 0 ? `, ${totales.OMITIDO} ya emitidas` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onVerDetalle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest hover:text-[var(--text-primary)] transition-all cursor-pointer"
          >
            <Eye size={12} />
            Ver detalle
          </button>
          <button
            onClick={onDescartar}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
            aria-label="Descartar"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default BannerLoteCuotas;
