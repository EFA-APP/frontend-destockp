import React from "react";
import DataTable from "../../../UI/DataTable/DataTable";
import { ArcaIcono, CargandoIcono } from "../../../../assets/Icons";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import { generarColumnasStock } from "./ColumnasDepositoStock";
import { Package, Search, Database, ChevronRight } from "lucide-react";

import DrawerActualizarStock from "../../../Modales/Articulos/ModalActualizarStock";

/**
 * Componente TablaDepositoStock: Visualización de la matriz de stock global.
 */
const TablaDepositoStock = () => {
  const {
    matrizStock,
    dataDepositosRaw,
    cargandoStock,
    busquedaStock,
    setBusquedaStock,
  } = useDepositoUI();

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
                Matriz de Inventario
              </h2>
              <p className="text-[12px] text-white/30 font-medium mt-0.5 uppercase tracking-widest">
                Distribución geográfica por artículo
              </p>
            </div>
          </div>

          {/* Mobile Search - Integrated */}
          <div className="relative md:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
            />
            <input
              type="text"
              value={busquedaStock}
              onChange={(e) => setBusquedaStock(e.target.value)}
              placeholder="Filtrar por nombre o código..."
              className="w-full bg-black/20 border border-white/10 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
        </div>

        <div className="p-0 md:p-4">
          {/* Desktop View: DataTable */}
          <div className="hidden md:block">
            <DataTable
              columnas={columnasStock}
              datos={matrizConAcciones} // <--- FIX: Usar matriz con handlers
              mostrarBuscador={false} // Custom search above
              placeholderBuscador="Filtrar productos..."
              mostrarAcciones={false}
              className="border-none shadow-none"
              cargando={cargandoStock}
            />
          </div>

          {/* Mobile View: Premium Designed Cards (REFINED CLARITY & SIZE) */}
          <div className="md:hidden flex flex-col gap-5 p-4 pb-28">
            {cargandoStock ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <CargandoIcono
                  size={32}
                  className="animate-spin text-amber-500/40"
                />
                <span className="text-[11px] text-white/20 font-bold uppercase tracking-widest">
                  Sincronizando Stock...
                </span>
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
                          <span className="text-[9px] font-mono font-black text-amber-500 px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/30 shadow-sm uppercase tracking-tighter">
                            SKU:{" "}
                            {row.codigoProducto?.toString().padStart(4, "0") ||
                              "N/A"}
                          </span>
                          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest bg-white/10 px-1.5 py-0.5 rounded border border-white/5">
                            {row.unidadMedida}
                          </span>
                        </div>
                        <h3 className="text-[16px] font-black text-white leading-[1.2] tracking-tight break-words">
                          {row.nombre}
                        </h3>
                      </div>
                      <div className="shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner text-amber-500/60">
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

                  {/* Global Total Footer - REFINED CLARITY & REDUCED SIZE */}
                  <div className="mt-auto p-4 bg-amber-500/10 border-t border-amber-500/20 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-0.5 leading-none">
                        Total Global
                      </span>
                      <span className="text-[11px] text-white/90 font-black uppercase tracking-tight">
                        Consolidado
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-amber-500 tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        {row.total || 0}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                          {row.unidadMedida}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 flex flex-col items-center justify-center opacity-20 text-center px-10">
                <Package
                  size={64}
                  strokeWidth={1}
                  className="mb-4 text-amber-500"
                />
                <span className="text-sm font-black uppercase tracking-[0.3em] text-white">
                  No se registraron productos
                </span>
                <p className="text-[10px] mt-2 normal-case font-medium text-white/60">
                  Ajusta los filtros para ver resultados
                </p>
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
