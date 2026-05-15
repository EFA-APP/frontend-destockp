import React, { memo, useEffect } from "react";
import { BuscadorIcono, AgregarIcono } from "../../../../assets/Icons";
import SkeletonProductoBusqueda from "../../../UI/Skeletons/SkeletonProductoBusqueda.jsx";
import { formatPrice } from "../../../../utils/formatters";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";

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
  tipoBusqueda,
  setTipoBusqueda,
  totales,
  siguientePaso,
}) => {
  // EFECTO PARA AUTO-SCROLL AL NAVEGAR CON FLECHAS
  React.useEffect(() => {
    if (highlightedIndex >= 0) {
      const el = document.getElementById(
        `prod-search-item-${highlightedIndex}`,
      );
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="shrink-0 py-2 bg-transparent relative">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch w-full">
        {/* SELECTOR DE TIPO DE BÚSQUEDA */}
        <TieneAccion accion="BUSCAR_MATERIA_PRIMA_SELECTOR">
          <div className="flex bg-[var(--surface-hover)] p-1.5 rounded-md border border-black/5 items-stretch shadow-sm w-full lg:w-fit shrink-0 gap-1 overflow-hidden">
            <button
              onClick={() => setTipoBusqueda("PRODUCTO")}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                tipoBusqueda === "PRODUCTO"
                  ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20"
                  : "text-black/40 hover:bg-black/5"
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => setTipoBusqueda("MATERIA_PRIMA")}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                tipoBusqueda === "MATERIA_PRIMA"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  : "text-black/40 hover:bg-black/5"
              }`}
            >
              Materia Prima
            </button>
          </div>
        </TieneAccion>

        <div className="flex flex-col lg:flex-row gap-4 flex-1 relative items-stretch lg:items-center">
          {/* INPUT CÓDIGO NORMAL */}
          <div className="relative flex-1 group border-1 border-[var(--primary)]/50! flex bg-white border border-black/5 rounded-md focus-within:border-black/20 focus-within:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all h-[54px] items-center">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-black/20 group-focus-within:text-black">
              <BuscadorIcono
                size={22}
                strokeWidth={2.5}
                color={
                  tipoBusqueda === "PRODUCTO" ? "var(--primary)" : "#f59e0b"
                }
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
              placeholder={`BUSCAR ${tipoBusqueda === "PRODUCTO" ? "PRODUCTO" : "MATERIA PRIMA"}...`}
              className="w-full bg-transparent pl-14 pr-4 py-4 text-[16px] font-black text-black focus:outline-none placeholder:text-black/10 placeholder:font-black uppercase tracking-tight"
            />

            {mostrarDropdownProducto && codigoBusqueda && (
              <div className="absolute top-full mt-2 left-0 right-0 lg:min-w-[500px] max-h-[500px] overflow-y-auto custom-scrollbar bg-[var(--surface-active)] border border-black/10 rounded-md shadow-[0_25px_70px_rgba(0,0,0,0.3)] z-[100] p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
                {cargandoProductos && (
                  <div className="flex flex-col gap-2 p-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-[70px] bg-black/5 rounded-md animate-pulse flex flex-col justify-center px-4 gap-2"
                      >
                        <div className="h-4 w-3/4 bg-black/10 rounded" />
                        <div className="h-3 w-1/2 bg-black/5 rounded" />
                      </div>
                    ))}
                  </div>
                )}
                {!cargandoProductos && productos.length === 0 && (
                  <div className="px-4 py-12 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center text-black/10">
                      <BuscadorIcono
                        size={32}
                        color={
                          tipoBusqueda === "PRODUCTO"
                            ? "var(--primary)"
                            : "#f59e0b"
                        }
                      />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-black/20">
                      Sin resultados en{" "}
                      {tipoBusqueda === "PRODUCTO"
                        ? "Productos"
                        : "Materia Prima"}
                    </span>
                  </div>
                )}
                {!cargandoProductos &&
                  productos.length > 0 &&
                  productos.map((p, index) => {
                    const isHighlighted = index === highlightedIndex;
                    const stockClass =
                      p.stock > 0
                        ? "text-emerald-600 bg-emerald-500/10"
                        : "text-rose-600 bg-rose-500/10";

                    const itemNombre = p.nombre;
                    const itemSubtitulo =
                      tipoBusqueda === "PRODUCTO"
                        ? p.descripcion || "ITEM GENERAL"
                        : p.tipo || "INSUMO";
                    const itemPrecio =
                      tipoBusqueda === "PRODUCTO"
                        ? getPrecio(p, columnaPrecioSeleccionada)
                        : 0;

                    return (
                      <div
                        id={`prod-search-item-${index}`}
                        key={p.codigoSecuencial || index}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          agregarItem({ ...p, tipoArticulo: tipoBusqueda }, 1);
                          setMostrarDropdownProducto(false);
                        }}
                        className={`px-4 py-4 cursor-pointer rounded-md transition-all border border-transparent ${isHighlighted ? (tipoBusqueda === "PRODUCTO" ? "bg-[var(--primary)]" : "bg-amber-500") + " text-white shadow-xl scale-[1.02] z-10" : "hover:bg-black/[0.04]"}`}
                      >
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex flex-col overflow-hidden">
                            <span
                              className={`font-black text-[13px] uppercase truncate ${isHighlighted ? "text-white" : "text-black"}`}
                            >
                              {itemNombre}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-widest truncate ${isHighlighted ? "text-white/60" : "text-black/40"}`}
                              >
                                {itemSubtitulo}
                              </span>
                              {tipoBusqueda === "MATERIA_PRIMA" && (
                                <span
                                  className={`text-[9px] font-black px-1.5 py-0.5 rounded ${isHighlighted ? "bg-white/20 text-white" : "bg-amber-50 text-amber-500"}`}
                                >
                                  {p.unidadMedida}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0">
                            {tipoBusqueda === "PRODUCTO" && (
                              <span
                                className={`text-[14px] font-black ${isHighlighted ? "text-white" : "text-[var(--primary)]"}`}
                              >
                                {formatPrice(itemPrecio)}
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter mt-1 ${isHighlighted ? "bg-white/20 text-white" : stockClass}`}
                            >
                              {p.stock > 0 ? `Stock: ${p.stock}` : "S/S"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* RESUMEN RÁPIDO Y BOTÓN SIGUIENTE */}
          <div className="flex items-center justify-between gap-4 bg-[var(--surface-hover)] border border-black/10 p-2 rounded-md h-[54px] shadow-sm">
            <div className="flex flex-col items-end px-4 border-r border-black/5">
              <span className="text-[8px] font-black uppercase tracking-widest text-[var(--primary)]/70 leading-none mb-1">
                Total Carrito
              </span>
              <span className="text-[20px] font-black text-[var(--primary)]/95 leading-none tracking-tighter">
                {formatPrice(totales?.total || 0)}
              </span>
            </div>

            <button
              onClick={siguientePaso}
              disabled={!totales?.total || totales.total <= 0}
              className={`h-full px-10 rounded-md font-black text-[12px] uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-3 ${
                totales?.total > 0
                  ? "bg-black text-white hover:bg-zinc-800 shadow-black/20"
                  : "bg-black/5 text-black/20 cursor-not-allowed shadow-none"
              }`}
            >
              Siguiente
              <span className="text-[16px]">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(BusquedaProducto);
