import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Search, Plus, Minus, Check, ShoppingBag, Eye } from "lucide-react";
import { formatPrice } from "../../../utils/formatters";

const SelectorArticuloModal = ({
  isOpen,
  onClose,
  productos = [],
  cargandoProductos = false,
  codigoBusqueda,
  setCodigoBusqueda,
  agregarItem,
  getPrecio,
  columnaPrecioSeleccionada = "precioVenta",
  tipoBusqueda = "PRODUCTO",
  setTipoBusqueda,
}) => {
  const [cantidades, setCantidades] = useState({});
  const [agregados, setAgregados] = useState({});
  const inputRef = useRef(null);

  // Escuchar la tecla ESC para cerrar el modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-enfocar el input de búsqueda al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleIncrement = (id) => {
    setCantidades((prev) => ({
      ...prev,
      [id]: (prev[id] || 1) + 1,
    }));
  };

  const handleDecrement = (id) => {
    setCantidades((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) - 1),
    }));
  };

  const handleQuantityChange = (id, val) => {
    const parsed = parseFloat(val) || 1;
    setCantidades((prev) => ({
      ...prev,
      [id]: Math.max(1, parsed),
    }));
  };

  const handleAgregar = (prod) => {
    const qty = cantidades[prod.codigo] || 1;
    // Adaptación para Compras (tipoArticulo)
    const itemToAdd = setTipoBusqueda ? { ...prod, tipoArticulo: tipoBusqueda } : prod;
    
    agregarItem(itemToAdd, qty);
    
    // Activar feedback de agregado
    setAgregados((prev) => ({ ...prev, [prod.codigo]: true }));
    setTimeout(() => {
      setAgregados((prev) => ({ ...prev, [prod.codigo]: false }));
    }, 1500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-4xl bg-white rounded-md shadow-2xl border border-gray-100 flex flex-col my-8 max-h-[90vh] md:max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="p-5 border-b border-gray-150 flex justify-between items-center bg-[#f8fafc] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-gray-900 uppercase tracking-tight">
                Catálogo de Artículos
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                Busque y agregue múltiples ítems al carrito con su respectiva cantidad
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all group shadow-sm cursor-pointer"
          >
            <X
              size={18}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>

        {/* Buscador & Selectores */}
        <div className="p-5 border-b border-gray-100 bg-white shrink-0 flex flex-col gap-3">
          {/* Selector de Categoría (Sólo si setTipoBusqueda está disponible) */}
          {setTipoBusqueda && (
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-1 rounded-md self-start">
              <button
                type="button"
                onClick={() => setTipoBusqueda("PRODUCTO")}
                className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-wider transition ${
                  tipoBusqueda === "PRODUCTO"
                    ? "bg-[var(--primary)] text-white shadow"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Productos
              </button>
              <button
                type="button"
                onClick={() => setTipoBusqueda("MATERIA_PRIMA")}
                className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-wider transition ${
                  tipoBusqueda === "MATERIA_PRIMA"
                    ? "bg-amber-500 text-white shadow"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Materia Prima
              </button>
            </div>
          )}

          {/* Barra de Búsqueda */}
          <div className="relative group flex bg-white border border-gray-300 rounded-md focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/10 transition h-[50px] items-center w-full shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={codigoBusqueda}
              onChange={(e) => setCodigoBusqueda(e.target.value)}
              placeholder={`Escriba para buscar ${tipoBusqueda === "PRODUCTO" ? "productos" : "materia prima"} por nombre o código...`}
              className="w-full bg-transparent pl-11 pr-10 py-3 text-sm font-bold text-gray-900 focus:outline-none placeholder:text-gray-400 placeholder:font-bold uppercase tracking-tight"
            />
            {codigoBusqueda && (
              <button
                onClick={() => setCodigoBusqueda("")}
                className="absolute right-3 w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Listado de Artículos */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-gray-50/50">
          {cargandoProductos ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-white border border-gray-200 rounded-md animate-pulse p-4 flex justify-between items-center">
                  <div className="space-y-2 w-1/3">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          ) : productos.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
              <Search className="w-12 h-12 text-gray-300" />
              <p className="text-xs font-black uppercase tracking-widest">
                Sin Resultados
              </p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase">
                {codigoBusqueda ? "Pruebe con otro término de búsqueda" : "Comience a escribir para buscar artículos"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {productos.map((p) => {
                const stockVal = parseFloat(p.stock) || 0;
                const isAvailable = stockVal > 0;
                const isSelected = agregados[p.codigo];
                const itemPrecio = tipoBusqueda === "PRODUCTO" && getPrecio ? getPrecio(p, columnaPrecioSeleccionada) : (parseFloat(p.precio) || 0);
                const quantity = cantidades[p.codigo] || 1;

                return (
                  <div
                    key={p.codigo}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between bg-white border rounded-md p-4 transition gap-4 shadow-sm hover:border-[var(--primary)]/30 hover:shadow-md ${
                      isSelected ? "border-emerald-500/40 bg-emerald-50/10" : "border-gray-200"
                    }`}
                  >
                    {/* Detalles del Producto */}
                    <div className="flex-1 min-w-0">
                      <span className="font-extrabold text-xs md:text-sm text-gray-900 uppercase block truncate">
                        {p.nombre}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase mt-0.5 block truncate">
                        {tipoBusqueda === "PRODUCTO" ? p.descripcion || "Item General" : p.tipo || "Materia Prima"}
                      </span>
                      
                      <div className="flex gap-2 items-center mt-2">
                        {/* Badge de Stock */}
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                            isAvailable
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {isAvailable ? `Stock: ${p.stock}` : "Sin Stock"}
                        </span>
                        
                        {tipoBusqueda === "MATERIA_PRIMA" && p.unidadMedida && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                            {p.unidadMedida}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Precios y Cantidad */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                      {/* Mostrar Precio */}
                      {tipoBusqueda === "PRODUCTO" && (
                        <div className="flex flex-col items-start sm:items-end">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                            Precio
                          </span>
                          <span className="text-sm font-black text-gray-900 mt-1">
                            {formatPrice(itemPrecio)}
                          </span>
                        </div>
                      )}

                      {/* Selector de Cantidad */}
                      <div className="flex items-center bg-gray-100 border border-gray-200 rounded-full p-0.5 shadow-inner">
                        <button
                          type="button"
                          onClick={() => handleDecrement(p.codigo)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 text-gray-600 transition active:scale-90 font-black shadow-sm cursor-pointer"
                        >
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(p.codigo, e.target.value)}
                          className="w-10 bg-transparent border-none text-center font-black text-xs text-gray-800 focus:outline-none p-0"
                          min="1"
                        />
                        <button
                          type="button"
                          onClick={() => handleIncrement(p.codigo)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 text-gray-600 transition active:scale-90 font-black shadow-sm cursor-pointer"
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>

                      {/* Botón Agregar */}
                      <button
                        type="button"
                        onClick={() => handleAgregar(p)}
                        className={`w-32 h-[38px] rounded-md font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-emerald-100"
                            : "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 border-[var(--primary)] shadow-sm active:scale-95"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check size={14} strokeWidth={3} />
                            Agregado
                          </>
                        ) : (
                          <>
                            <Plus size={14} strokeWidth={3} />
                            Añadir
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-150 bg-white flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-extrabold text-xs uppercase tracking-wider rounded-md transition cursor-pointer"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SelectorArticuloModal;
