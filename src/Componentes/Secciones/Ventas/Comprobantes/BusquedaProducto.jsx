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
  setColumnaPrecioSeleccionada,
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
    <div className="shrink-0 p-4 bg-[var(--surface-active)] shadow-sm z-10 flex flex-col gap-3 relative">
      {/* FILA 1: SELECTORES */}
      <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
        {/* SELECTOR DE LISTA DE PRECIOS */}
        {cargandoConfigs ? (
          <div className="flex-1 md:w-32 h-12 bg-[var(--surface)] border-2 border-[var(--border-medium)] rounded-md animate-pulse" />
        ) : camposDinamicos.length > 0 && (
          <select
            value={columnaPrecioSeleccionada}
            onChange={(e) => {
              setColumnaPrecioSeleccionada(e.target.value);
              setTimeout(() => inputCodigoRef.current?.focus(), 50);
            }}
            title="Lista de Precio (Columna Dinámica)"
            className="flex-1 md:w-32 h-12 bg-[var(--surface)] border-2 border-[var(--border-medium)] rounded-md px-2 text-[10px] md:text-xs font-black text-emerald-500 focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer appearance-none text-center truncate"
          >
            {camposDinamicos.map((c) => (
              <option key={c.claveCampo} value={c.claveCampo}>
                {c.nombreCampo.toUpperCase()}
              </option>
            ))}
          </select>
        )}

        {/* FILA 2: BUSCADOR + CANTIDAD */}
        <div className="flex flex-[2] gap-2 w-full md:w-auto relative items-center">
          {/* INPUT CÓDIGO CON SELECTOR INTEGRADO */}
          <div className="relative flex-1 group flex bg-[var(--surface)] border-2 border-[var(--border-medium)] rounded-md focus-within:border-[var(--primary)] transition-colors shadow-inner h-12">
            <select
              value={busquedaClaveProducto}
              onChange={(e) => {
                setBusquedaClaveProducto(e.target.value);
                setTimeout(() => inputCodigoRef.current?.focus(), 50);
              }}
              className="bg-[var(--fill)] border-r border-[var(--border-medium)] px-2 h-full text-[9px] font-black text-[var(--primary)] focus:outline-none cursor-pointer appearance-none hover:bg-[var(--surface-hover)] transition-colors uppercase tracking-tighter rounded-l-[4px]"
            >
              <option value="nombre">NOM</option>
              <option value="codigo">COD</option>
            </select>

            <div className="absolute inset-y-0 left-12 pl-1 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
              <BuscadorIcono size={18} />
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
              placeholder={`Buscar (ENTER)`}
              className="w-full bg-transparent border-none pl-12 pr-4 text-base font-bold text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)] placeholder:font-normal placeholder:text-white/30"
            />

            {/* Desplegable de Productos */}
            {mostrarDropdownProducto && codigoBusqueda && (
              <div className="absolute top-full mt-1 left-0 right-0 max-h-64 overflow-y-auto custom-scrollbar bg-[var(--surface-active)] border border-white/10 rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[100] p-1 flex flex-col">
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
                        ? "text-emerald-500 bg-emerald-500/10"
                        : "text-red-500 bg-red-500/10";
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
                        className={`px-3 py-3 border-b border-[var(--border-subtle)] last:border-0 cursor-pointer rounded transition-colors group ${isHighlighted ? "bg-[var(--surface-hover)] border-l-2 border-l-[var(--primary)]" : "hover:bg-[var(--surface-hover)]"}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="font-black text-sm text-white transition-colors">
                              {p.nombre}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]/70 mt-0.5 whitespace-normal break-words line-clamp-2">
                              {p.descripcion || "Sin Descripción"}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[11px] font-black text-[var(--primary-light)]">
                              $
                              {getPrecio(
                                p,
                                columnaPrecioSeleccionada,
                              ).toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.5 rounded ${stockClass}`}
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
                    className={`px-3 py-3 border-t border-[var(--border-subtle)] cursor-pointer rounded transition-colors group ${highlightedIndex === productos.length ? "bg-emerald-500/10 border-l-2 border-l-emerald-500" : "hover:bg-emerald-500/5"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <AgregarIcono size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-xs text-emerald-400 uppercase tracking-widest">
                          Usar como item manual
                        </span>
                        <span className="text-[10px] text-white/40 font-bold truncate max-w-[200px]">
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

export default BusquedaProducto;
