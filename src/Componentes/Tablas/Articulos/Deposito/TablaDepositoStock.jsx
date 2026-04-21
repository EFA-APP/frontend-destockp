import React from "react";
import DataTable from "../../../UI/DataTable/DataTable";
import { CargandoIcono } from "../../../../assets/Icons";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import { generarColumnasStock } from "./ColumnasDepositoStock";
import { Package, Search, Database, ChevronRight } from "lucide-react";
import SkeletonFilaTabla from "../../../UI/Skeletons/SkeletonFilaTabla.jsx";

import DrawerActualizarStock from "../../../Modales/Articulos/ModalActualizarStock";

/**
 * Componente TablaDepositoStock: Visualización de la matriz de stock global.
 */
const TablaDepositoStock = ({ tipoArticulo = "PRODUCTO", titulo }) => {
  const [filtros, setFiltros] = React.useState({ pagina: 1, limite: 10 });
  const [busquedaInput, setBusquedaInput] = React.useState("");
  const [busquedaClave, setBusquedaClave] = React.useState("nombre"); // 'nombre' o 'codigo'

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros((prev) => {
        const nuevos = { ...prev, pagina: 1 }; // Resetear página con nueva búsqueda
        delete nuevos.buscarPorNombre;
        delete nuevos.buscarPorCodigo;

        if (busquedaInput) {
          if (busquedaClave === "nombre") {
            nuevos.buscarPorNombre = busquedaInput;
          }
          if (busquedaClave === "codigo") {
            const num = Number(busquedaInput);
            if (!isNaN(num)) nuevos.buscarPorCodigo = num;
          }
        }
        return nuevos;
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [busquedaInput, busquedaClave]);

  const { matrizStock, dataDepositosRaw, cargandoStock, meta } =
    useDepositoUI({ ...filtros, tipoArticulo });

  const [drawerData, setDrawerData] = React.useState({
    isOpen: false,
    fila: null,
    depositoInicial: null,
  });

  const handleAbrirDrawer = (fila, depositoId = null) => {
    setDrawerData({ isOpen: true, fila, depositoInicial: depositoId });
  };

  const cerrarDrawer = () => {
    setDrawerData({ isOpen: false, fila: null, depositoInicial: null });
  };

  const matrizConAcciones = React.useMemo(
    () =>
      matrizStock.map((fila) => ({
        ...fila,
        onActualizarStock: handleAbrirDrawer,
      })),
    [matrizStock],
  );

  const columnasStock = React.useMemo(
    () => generarColumnasStock(dataDepositosRaw),
    [dataDepositosRaw],
  );

  return (
    <React.Fragment>
      <div className="bg-[var(--surface)] border border-white/5 rounded-md shadow-2xl overflow-hidden">
        {/* Table Header */}
        <div className="px-4 py-4 md:px-6 md:py-5 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-[var(--primary)]/10 rounded-md border border-[var(--primary)]/10 text-[var(--primary)]">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-white leading-tight uppercase tracking-tight">
                {titulo || `Matriz de Inventario (${tipoArticulo === "MATERIA_PRIMA" ? "Materia Prima" : "Productos"})`}
              </h2>
              <p className="text-[12px] text-white/30 font-medium mt-0.5 uppercase tracking-widest">
                Distribución geográfica por artículo
              </p>
            </div>
          </div>

          {/* Buscador integrado en DataTable */}
        </div>

        <div className="p-0 md:p-4">
          {/* Desktop View: DataTable */}
          <div className="hidden md:block">
            <DataTable
              id_tabla={`stock_deposito_${tipoArticulo.toLowerCase()}`}
              columnas={columnasStock}
              datos={matrizConAcciones}
              mostrarBuscador={true}
              busqueda={busquedaInput}
              setBusqueda={setBusquedaInput}
              opcionesBusqueda={[
                { label: "Por Nombre", value: "nombre" },
                { label: "Por Código", value: "codigo" },
              ]}
              busquedaClave={busquedaClave}
              setBusquedaClave={setBusquedaClave}
              placeholderBuscador="Escribe para buscar..."
              mostrarAcciones={false}
              className="border-none shadow-none"
              loading={cargandoStock}
              meta={meta}
              onPageChange={(p) =>
                setFiltros((prev) => ({ ...prev, pagina: p }))
              }
              onLimitChange={(l) =>
                setFiltros((prev) => ({ ...prev, limite: l, pagina: 1 }))
              }
            />
          </div>

          {/* Mobile View: Premium Designed Cards (REFINED CLARITY & SIZE) */}
          <div className="md:hidden flex flex-col gap-5 p-4 pb-28">
            {/* Buscador Mobile */}
            <div className="flex flex-col gap-3 bg-[#181818]/60 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl">
              <div className="flex gap-2">
                <select
                  value={busquedaClave}
                  onChange={(e) => setBusquedaClave(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white/80 focus:outline-none focus:border-[var(--primary)]/50 appearance-none cursor-pointer"
                >
                  <option value="nombre" className="bg-[#181818]">
                    Nombre
                  </option>
                  <option value="codigo" className="bg-[#181818]">
                    Código
                  </option>
                </select>
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    type="text"
                    value={busquedaInput}
                    onChange={(e) => setBusquedaInput(e.target.value)}
                    placeholder="Escribe para buscar..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--primary)]/50 transition-all font-medium placeholder:text-white/20"
                  />
                </div>
              </div>
            </div>

            {cargandoStock ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonFilaTabla key={i} />
                ))}
              </div>
            ) : matrizStock.length > 0 ? (
              matrizConAcciones.map((row, idx) => (
                <div
                  key={idx}
                  className="bg-[#181818] rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Product Identity Header */}
                  <div className="p-4 bg-gradient-to-br from-white/[0.06] to-transparent border-b border-white/5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-black text-[var(--primary)] px-1.5 py-0.5 bg-[var(--primary)]/10 rounded border border-[var(--primary)]/30 shadow-sm uppercase tracking-tighter">
                            {(row.codigoProducto || row.codigoMateriaPrima)?.toString().padStart(4, "0") ||
                              "N/A"}
                          </span>
                          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest bg-white/10 px-1.5 py-0.5 rounded border border-white/5">
                            {row.unidadMedida}
                          </span>
                        </div>
                        <h3 className="text-[16px] font-black text-white leading-[1.2] tracking-tight break-words">
                          {row.nombre}
                        </h3>
                        <span className="text-[9px] font-black text-white/60 uppercase tracking-widest py-0.5 flex justify-start items-center gap-2">
                          <ChevronRight
                            size={14}
                            className={`transition-all text-[var(--primary-light)] group-hover:translate-x-1`}
                          />
                          <p className="text-white/60">{row.descripcion}</p>
                        </span>
                      </div>
                      <div className="shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner text-[var(--primary)]/60">
                          <Package size={20} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warehouse Breakdown */}
                  <div className="p-3 bg-black/30 flex flex-col gap-1.5">
                    <div className="px-1 mb-1">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-4 h-[1px] bg-white/20" />
                        Existencias
                      </span>
                    </div>

                    {columnasStock
                      .filter(
                        (col) =>
                          col.key !== "codigoSecuencial" &&
                          col.key !== "nombre" &&
                          col.key !== "nombreArticulo" &&
                          col.key !== "unidadMedida" &&
                          col.key !== "acciones_stock" &&
                          col.key !== "total",
                      )
                      .map((col, cIdx) => {
                        const stock = row[col.key] || 0;
                        const tieneStock = stock > 0;
                        return (
                          <div
                            key={cIdx}
                            onClick={() => {
                              const depId = col.key.startsWith("dep_")
                                ? col.key.split("_")[1]
                                : null;
                              if (depId) row.onActualizarStock(row, depId);
                            }}
                            className={`group flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                              tieneStock
                                ? "bg-white/5 border border-white/10 shadow-sm"
                                : "bg-white/[0.02] border border-transparent opacity-80"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${tieneStock ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-white/10"}`}
                              />
                              <span
                                className={`text-[12px] font-black uppercase tracking-wider truncate transition-colors ${tieneStock ? "text-white" : "text-white/80"}`}
                              >
                                {col.etiqueta || col.header}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-end">
                                <span
                                  className={`text-[16px] font-black tabular-nums transition-colors leading-none ${tieneStock ? "text-emerald-400" : "text-white/10"}`}
                                >
                                  {stock}
                                </span>
                              </div>
                              <ChevronRight
                                size={14}
                                className={`transition-all ${tieneStock ? "text-emerald-500 group-hover:translate-x-1" : "text-white/5"}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 flex flex-col items-center justify-center opacity-20 text-center px-10">
                <Package
                  size={64}
                  strokeWidth={1}
                  className="mb-4 text-[var(--primary)]"
                />
                <span className="text-sm font-black uppercase tracking-[0.3em] text-white">
                  No se registraron productos
                </span>
                <p className="text-[10px] mt-2 normal-case font-medium text-white/60">
                  Ajusta los filtros para ver resultados
                </p>
              </div>
            )}

            {/* Paginación Mobile */}
            {meta && (
              <div className="flex flex-col items-center gap-3 mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Total: {meta.total} registros
                </p>
                <div className="flex items-center gap-1.5 bg-[#181818] border border-white/10 rounded-lg p-1">
                  <button
                    disabled={!meta.prev}
                    onClick={() =>
                      setFiltros((prev) => ({ ...prev, pagina: meta.prev }))
                    }
                    className="p-1 rounded text-white/60 hover:bg-white/5 disabled:opacity-30 transition-all font-bold text-[11px] px-3"
                  >
                    Anterior
                  </button>
                  <span className="text-[11px] font-black text-white px-2">
                    {meta.currentPage} / {meta.lastPage || 1}
                  </span>
                  <button
                    disabled={!meta.next}
                    onClick={() =>
                      setFiltros((prev) => ({ ...prev, pagina: meta.next }))
                    }
                    className="p-1 rounded text-white/60 hover:bg-white/5 disabled:opacity-30 transition-all font-bold text-[11px] px-3"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DrawerActualizarStock
        isOpen={drawerData.isOpen}
        onClose={cerrarDrawer}
        fila={drawerData.fila}
        depositosRaw={dataDepositosRaw}
        depositoInicial={drawerData.depositoInicial}
      />
    </React.Fragment>
  );
};

export default TablaDepositoStock;
