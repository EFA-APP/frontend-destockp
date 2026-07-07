import React, { useState, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Calendar as CalendarIcon, X } from "lucide-react";
import "./DateRangePicker.css"; // Archivo para sobreescribir los colores con --primary

const DateRangePicker = ({ fechaDesde, fechaHasta, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Inicializar el estado interno de DayPicker con objetos Date
  const parseDate = (dStr) => (dStr ? new Date(dStr + "T00:00:00") : undefined);

  const [range, setRange] = useState({
    from: parseDate(fechaDesde),
    to: parseDate(fechaHasta),
  });

  // Si las props cambian (por un limpiar filtro externo), actualizar el estado local
  useEffect(() => {
    setRange({
      from: parseDate(fechaDesde),
      to: parseDate(fechaHasta),
    });
  }, [fechaDesde, fechaHasta]);

  // Manejar clics fuera del popover para cerrarlo
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (selectedRange) => {
    setRange(selectedRange);

    // Si selecciona los dos, o borra ambos, podemos elegir cerrar
    // o simplemente avisar al padre para que dispare el fetch
  };

  const handleApply = () => {
    // Formatear a 'YYYY-MM-DD' para el backend
    const fmt = (d) => (d ? format(d, "yyyy-MM-dd") : "");
    onChange(fmt(range?.from), fmt(range?.to));
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setRange({ from: undefined, to: undefined });
    onChange("", "");
    setIsOpen(false);
  };

  const hasSelection = fechaDesde || fechaHasta;

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Botón / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 h-9 px-3 border rounded-[8px] text-xs font-semibold transition-colors cursor-pointer w-full md:w-auto ${
          hasSelection
            ? "border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] bg-[var(--color-brand-soft)]"
            : "border-[var(--color-neutral-border)] text-[var(--color-neutral-text-main)] hover:bg-gray-50 bg-white"
        }`}
      >
        <CalendarIcon
          size={14}
          className={hasSelection ? "text-[var(--color-brand-primary)]" : "text-[var(--color-neutral-text-muted)]"}
        />
        <span>
          {hasSelection ? (
            <>
              {fechaDesde
                ? format(parseDate(fechaDesde), "dd MMM, yyyy", { locale: es })
                : "..."}
              {" - "}
              {fechaHasta
                ? format(parseDate(fechaHasta), "dd MMM, yyyy", { locale: es })
                : "..."}
            </>
          ) : (
            "Seleccionar fechas..."
          )}
        </span>
        {hasSelection && (
          <X
            size={14}
            className="ml-1 opacity-50 hover:opacity-100 cursor-pointer"
            onClick={handleClear}
          />
        )}
      </button>

      {/* Popover del Calendario */}
      {isOpen && (
        <div className="absolute z-[1000] mt-2 bg-white border border-[var(--color-neutral-border)] rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-4 right-0 lg:left-0 lg:right-auto animate-in fade-in zoom-in-95 duration-200">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={1}
            locale={es}
            className="rdp-custom"
            // Se quitó disabled={{ after: new Date() }} a pedido del usuario (permite fechas futuras)
          />
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--color-neutral-border)]">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[var(--color-neutral-text-main)] hover:bg-gray-50 border border-[var(--color-neutral-border)] rounded-[8px] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] rounded-[8px] transition-colors cursor-pointer"
            >
              Aplicar Filtro
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
