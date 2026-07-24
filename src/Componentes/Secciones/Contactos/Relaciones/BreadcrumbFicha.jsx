import { ChevronRight } from "lucide-react";

// Feature 33 (contactos-relaciones-ui). Breadcrumb de drill-down: estado
// local en DashboardContactos.jsx (pilaBreadcrumb), NO en la URL (design.md
// §1.4). Permite volver a cualquier punto anterior del camino con un clic
// (R21).
const BreadcrumbFicha = ({ pila = [], onVolverA }) => {
  if (!pila.length) return null;

  return (
    <div className="flex items-center flex-wrap gap-1.5 px-1 py-2">
      {pila.map((paso, i) => {
        const esActual = i === pila.length - 1;
        const nombre =
          paso.contacto?.razonSocial ||
          `${paso.contacto?.nombre || ""} ${paso.contacto?.apellido || ""}`.trim() ||
          "Sin Nombre";
        return (
          <span
            key={paso.contacto?.codigo ?? i}
            className="flex items-center gap-1.5"
          >
            {i > 0 && paso.relacionOrigen && (
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-black mr-0.5">
                {paso.relacionOrigen}
              </span>
            )}
            <button
              type="button"
              onClick={() => !esActual && onVolverA?.(i)}
              disabled={esActual}
              className={
                esActual
                  ? "text-[12px] text-[var(--primary)] font-black uppercase tracking-wide cursor-default"
                  : "text-[12px] text-[var(--text-muted)] hover:text-[var(--primary)] font-bold uppercase tracking-wide underline decoration-dashed underline-offset-4 cursor-pointer transition-colors"
              }
            >
              {nombre}
            </button>
            {!esActual && (
              <ChevronRight size={12} className="text-[var(--text-muted)]" />
            )}
          </span>
        );
      })}
    </div>
  );
};

export default BreadcrumbFicha;
