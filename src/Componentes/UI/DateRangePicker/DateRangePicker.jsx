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
        className={`flex items-center gap-2 h-9 px-3 border rounded-md text-xs font-bold transition-colors cursor-pointer w-full md:w-auto ${
          hasSelection
            ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5"
            : "border-[var(--border-subtle)] text-gray-700 hover:border-gray-300 bg-white"
        }`}
      >
        <CalendarIcon
          size={14}
          className={hasSelection ? "text-[var(--primary)]" : "text-gray-400"}
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
        <div className="absolute z-[1000] mt-2 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md shadow-2xl p-4 right-0 lg:left-0 lg:right-auto animate-in fade-in zoom-in-95 duration-200">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={1}
            locale={es}
            className="rdp-custom"
            // Se quitó disabled={{ after: new Date() }} a pedido del usuario (permite fechas futuras)
          />
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--fill-secondary)] rounded-md transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-xs font-bold text-white bg-[var(--primary)] hover:brightness-110 rounded-md transition-all shadow-sm shadow-[var(--primary)]/20 cursor-pointer"
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
