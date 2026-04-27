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
    <div className="shrink-0 py-2 bg-transparent relative">
      <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
        <div className="flex flex-[2] gap-2 w-full md:w-auto relative items-center">
          {/* INPUT CÓDIGO NORMAL */}
          <div className="relative flex-1 group border-1 border-[var(--primary)]/50! flex bg-white border border-black/5 rounded-md focus-within:border-black/20 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all h-[56px] items-center">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-black/20 group-focus-within:text-black">
              <BuscadorIcono
                size={22}
                strokeWidth={2.5}
                color={"var(--primary)"}
              />
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
              placeholder="Buscar por Nombre, Código de Barras o ID..."
              className="w-full bg-transparent pl-14 pr-4 text-[15px] font-bold text-black focus:outline-none placeholder:text-black/20 placeholder:font-bold uppercase tracking-tight"
            />

            {mostrarDropdownProducto && codigoBusqueda && (
              <div className="absolute top-full mt-2 left-0 right-0 max-h-[450px] overflow-y-auto custom-scrollbar bg-[var(--surface-active)] border border-black/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] z-[100] p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-md">
                {cargandoProductos && (
                  <div className="flex flex-col gap-2 p-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-[70px] bg-black/5 rounded-xl animate-pulse flex flex-col justify-center px-4 gap-2"
                      >
                        <div className="h-4 w-3/4 bg-black/10 rounded" />
                        <div className="h-3 w-1/2 bg-black/5 rounded" />
                      </div>
                    ))}
                  </div>
                )}
                {!cargandoProductos && productos.length === 0 && (
                  <div className="px-4 py-10 text-center flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                      <BuscadorIcono size={28} color={"var(--primary)"} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">
                      No se encontraron coincidencias
                    </span>
                  </div>
                )}
                {!cargandoProductos &&
                  productos.length > 0 &&
                  productos.map((p, index) => {
                    const isHighlighted = index === highlightedIndex;
                    const stockClass =
                      p.stock > 0
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-rose-600 bg-rose-50";
                    return (
                      <div
                        id={`prod-search-item-${index}`}
                        key={p.codigoSecuencial || index}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          agregarItem(p, 1);
                          setMostrarDropdownProducto(false);
                        }}
                        className={`px-4 py-3.5 cursor-pointer rounded-md transition-all border border-transparent ${isHighlighted ? "bg-[var(--primary)]/10! text-black shadow-lg shadow-black/10 scale-[1.01]" : "hover:bg-black/[0.03]"}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`font-black text-[14px] uppercase tracking-tight text-[var(--primary)]`}
                            >
                              {p.nombre}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold text-[var(--primary)]/70! uppercase tracking-widest`}
                              >
                                {p.descripcion || "ITEM GENERAL"}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`text-[17px] font-black ${isHighlighted ? "text-[var(--primary)]" : "text-black"}`}
                            >
                              $
                              {getPrecio(
                                p,
                                columnaPrecioSeleccionada,
                              ).toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${stockClass}`}
                            >
                              {p.stock > 0 ? `Stock: ${p.stock}` : "Sin Stock"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(BusquedaProducto);
