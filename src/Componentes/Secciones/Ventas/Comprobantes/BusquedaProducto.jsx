import { memo } from "react";
import { BuscadorIcono, AgregarIcono } from "../../../../assets/Icons";
import SkeletonProductoBusqueda from "../../../UI/Skeletons/SkeletonProductoBusqueda.jsx";

const BusquedaProducto = ({
  inputCodigoRef,
  inputCantidadRef,
  codigoBusqueda,
  setCodigoBusqueda,
  busquedaClaveProducto,
  setBusquedaClaveProducto,
  camposDinamicos,
  columnaPrecioSeleccionada,
  cargandoConfigs,
  cargandoProductos,
  productos,
  highlightedIndex,
  setHighlightedIndex,
  setProductoEncontrado,
  mostrarDropdownProducto,
  setMostrarDropdownProducto,
  handleCodigoKeyDown,
  agregarItem,
  cantidadInput,
  setCantidadInput,
  getPrecio,
}) => {
  return (
    <div className="shrink-0 px-4 py-2 bg-[var(--surface-active)] shadow-sm z-10 flex flex-col gap-3 relative">
      {/* FILA 1: SELECTORES */}
      <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
        <div className="flex flex-[2] gap-2 w-full md:w-auto relative items-center">
          {/* INPUT CÓDIGO NORMAL */}
          <div className="relative flex-1 group flex bg-[var(--surface)] border border-[var(--primary)]/20 rounded-[12px] focus-within:border-[var(--primary)] focus-within:shadow-[0_4px_16px_rgba(var(--primary-rgb),0.1)] transition-all h-[50px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--primary)] ">
              <BuscadorIcono size={20} color={"var(--primary)"} />
            </div>
            <input
              ref={inputCodigoRef}
              type="text"
              value={codigoBusqueda}
              onChange={(e) => {
                setCodigoBusqueda(e.target.value);
                setProductoEncontrado(null);
                setMostrarDropdownProducto(true);
              }}
              onFocus={() => setMostrarDropdownProducto(true)}
              onBlur={() =>
                setTimeout(() => setMostrarDropdownProducto(false), 200)
              }
              onKeyDown={handleCodigoKeyDown}
              placeholder="Escribe el nombre o código del producto..."
              className="w-full bg-transparent pl-[45px] pr-4 text-[16px] font-bold text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)] placeholder:font-medium"
            />

            {/* Desplegable de Productos */}
            {mostrarDropdownProducto && codigoBusqueda && (
              <div className="absolute top-full mt-1 left-0 right-0 max-h-64 overflow-y-auto custom-scrollbar bg-[var(--surface-active)] border border-black/10 rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[100] p-1 flex flex-col">
                {cargandoProductos && (
                  <div className="flex flex-col">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonProductoBusqueda key={i} />
                    ))}
                  </div>
                )}
                {!cargandoProductos && productos.length === 0 && (
                  <div className="px-3 py-2 text-xs text-red-400 font-bold text-center">
                    No se encontraron productos para "{codigoBusqueda}"
                  </div>
                )}
                {!cargandoProductos &&
                  productos.length > 0 &&
                  productos.map((p, index) => {
                    const isHighlighted = index === highlightedIndex;
                    const stockClass =
                      p.stock > 0
                        ? "text-emerald-700 bg-emerald-700/10"
                        : "text-red-700 bg-red-700/10";
                    return (
                      <div
                        id={`prod-search-item-${index}`}
                        key={p.codigoSecuencial || index}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Evita el blur del input
                          agregarItem(p, 1);
                          setMostrarDropdownProducto(false);
                        }}
                        className={`px-3 py-3 border-b border-[var(--border-subtle)] last:border-0 cursor-pointer rounded  group ${isHighlighted ? "bg-[var(--surface-hover)] border-l-2 border-l-[var(--primary)]" : "hover:bg-[var(--surface-hover)]"}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="font-black text-sm text-black ">
                              {p.nombre}
                            </span>
                            <span className="text-[12px] text-[var(--text-muted)]/70 mt-0.5 whitespace-normal break-words line-clamp-2">
                              {p.descripcion || "Sin Descripción"}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[13px] font-black text-[var(--primary-light)]">
                              $
                              {getPrecio(
                                p,
                                columnaPrecioSeleccionada,
                              ).toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            <span
                              className={`text-[12px] font-black px-1.5 py-0.5 rounded ${stockClass}`}
                            >
                              Stock: {p.stock || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* OPCIÓN: ITEM MANUAL */}
                {codigoBusqueda.length > 0 && (
                  <div
                    id={`prod-search-item-${productos.length}`}
                    onMouseEnter={() => setHighlightedIndex(productos.length)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const prodManual = {
                        id: `manual-${Date.now()}`,
                        codigoSecuencial: `M-${Date.now().toString().slice(-4)}`,
                        nombre: codigoBusqueda.toUpperCase(),
                        descripcion: "ITEM MANUAL / SERVICIO",
                        precioVenta: 0,
                        stock: 0,
                        manual: true,
                      };
                      agregarItem(prodManual, 1);
                      setMostrarDropdownProducto(false);
                    }}
                    className={`px-3 py-3 border-t border-[var(--border-subtle)] cursor-pointer rounded  group ${highlightedIndex === productos.length ? "bg-emerald-700/10 border-l-2 border-l-emerald-700" : "hover:bg-emerald-700/5"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-emerald-700/20 flex items-center justify-center text-emerald-700">
                        <AgregarIcono size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-xs text-emerald-400 uppercase tracking-widest">
                          Usar como item manual
                        </span>
                        <span className="text-[12px] text-black/40 font-bold truncate max-w-[200px]">
                          "{codigoBusqueda}"
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(BusquedaProducto);
