import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Seleccionar...",
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // Sincronizar searchTerm con el label del valor seleccionado cuando el menú está cerrado
  const selectedOption = options.find((opt) => opt.value === value);

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

  const handleSelect = (opt) => {
    if (!opt) return;
    onChange({ target: { name: "", value: opt.value } });
    setIsOpen(false);
    setSearchTerm("");
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
          handleSelect(filteredOptions[activeIndex]);
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

  return (
    <div
      className={`relative ${className}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-2.5 rounded-md border flex items-center justify-between cursor-pointer transition-all
          ${disabled ? "bg-black/5 opacity-60 cursor-not-allowed" : "bg-white hover:bg-gray-50"}
          ${isOpen ? "border-[var(--primary)] ring-4 ring-[var(--primary)]/10" : "border-gray-200"}
        `}
      >
        <span
          className={`text-[14px] truncate ${!selectedOption ? "text-[var(--text-muted)]" : "text-[var(--secondary)] font-bold"}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-[var(--surface)] border border-[var(--border-medium)]/40 rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-[var(--border-medium)]/20 flex items-center gap-2 bg-black/5">
            <Search size={16} className="text-[var(--text-muted)]" />
            <input
              autoFocus
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-[14px] py-1"
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <X
                size={16}
                className="cursor-pointer text-[var(--text-muted)] hover:text-black"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                }}
              />
            )}
          </div>

          <div
            ref={listRef}
            className="max-h-[250px] overflow-y-auto custom-scrollbar"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => (
                <div
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt);
                  }}
                  onMouseMove={() => setActiveIndex(index)}
                  className={`
                    px-4 py-3 text-[13px] cursor-pointer transition-colors flex items-center justify-between
                    ${index === activeIndex ? "bg-[var(--secondary)]/20 border-t border-t-[var(--secondary)]/40 border-b border-b-[var(--secondary)]/40" : ""}
                    ${opt.value === value ? "text-[var(--primary)] font-bold" : "text-[var(--text-primary)]"}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {opt.value === value && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                    )}
                    <span>{opt.label}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-[var(--text-muted)] text-[12px] font-bold uppercase tracking-widest">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
