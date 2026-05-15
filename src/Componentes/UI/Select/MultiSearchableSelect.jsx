import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X, Check } from "lucide-react";

const MultiSearchableSelect = ({
  options = [],
  value = [], // Array of selected values
  onChange,
  placeholder = "Seleccionar varios...",
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Resetear index cuando cambia la búsqueda o abre/cierra
  useEffect(() => {
    setActiveIndex(filteredOptions.length > 0 ? 0 : -1);
  }, [searchTerm, isOpen]);

  const handleToggleOption = (optValue) => {
    let newValue;
    if (value.includes(optValue)) {
      newValue = value.filter((v) => v !== optValue);
    } else {
      newValue = [...value, optValue];
    }
    onChange({ target: { value: newValue } });
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          handleToggleOption(filteredOptions[activeIndex].value);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        break;
      default:
        break;
    }
  };

  // Hacer scroll automático al elemento activo
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[activeIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  const handleRemoveOption = (optValue, e) => {
    e.stopPropagation();
    const newValue = value.filter((v) => v !== optValue);
    onChange({ target: { value: newValue } });
  };

  const handleSelectAll = (e) => {
    e.stopPropagation();
    const allValues = options.map((o) => o.value);
    onChange({ target: { value: allValues } });
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange({ target: { value: [] } });
  };

  return (
    <div
      className={`relative ${className}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 rounded-md border flex flex-wrap items-center gap-1.5 cursor-pointer transition-all min-h-[42px]
          ${disabled ? "bg-black/5 opacity-60 cursor-not-allowed" : "bg-white hover:bg-gray-50"}
          ${isOpen ? "border-[var(--primary)] ring-4 ring-[var(--primary)]/10" : "border-gray-200"}
        `}
      >
        {selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2 py-1">
            {selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-md flex items-center gap-2 shadow-md border-2 border-indigo-700/50 animate-in zoom-in duration-200 hover:bg-indigo-700 transition-colors group/chip"
              >
                <span className="tracking-tighter">
                  {opt.label.substring(0, 20)}
                  {opt.label.length > 20 ? "..." : ""}
                </span>
                <button
                  onClick={(e) => handleRemoveOption(opt.value, e)}
                  className="bg-white/20 hover:bg-white/40 rounded-full p-0.5 transition-colors"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[13px] text-[var(--text-muted)] ml-1 font-bold">
            {placeholder}
          </span>
        )}
        <div className="flex-1" />
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
            <Search size={14} className="text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Filtrar tipos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-[13px] py-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="p-2 border-b border-gray-50 flex items-center justify-between">
            <button
              onClick={handleSelectAll}
              className="text-[9px] font-black uppercase tracking-widest text-[var(--primary)] hover:underline"
            >
              Seleccionar Todos
            </button>
            <button
              onClick={handleClearAll}
              className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:underline"
            >
              Limpiar
            </button>
          </div>

          <div
            ref={listRef}
            className="max-h-[250px] overflow-y-auto custom-scrollbar"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = value.includes(opt.value);
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={opt.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleOption(opt.value);
                    }}
                    onMouseMove={() => setActiveIndex(idx)}
                    className={`
                      px-4 py-3 text-[12px] cursor-pointer transition-colors flex items-center justify-between group/opt
                      ${isActive ? "bg-[var(--secondary)]/20 border-t border-b border-[var(--secondary)]" : ""}
                      ${isSelected ? "text-indigo-700 font-black" : "text-gray-600 hover:bg-gray-50"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? "bg-indigo-600 border-indigo-600 shadow-sm scale-110" : "border-gray-200 group-hover/opt:border-indigo-300"}`}
                      >
                        {isSelected && (
                          <Check
                            size={12}
                            className="text-white"
                            strokeWidth={4}
                          />
                        )}
                      </div>
                      <span className={isSelected ? "font-black" : "font-bold"}>
                        {opt.label}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-400 text-[11px] font-bold uppercase">
                Sin resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSearchableSelect;
