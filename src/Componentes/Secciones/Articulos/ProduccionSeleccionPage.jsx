import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useObtenerProductos } from "../../../Backend/Articulos/queries/Producto/useObtenerProductos.query";
import {
  ProduccionIcono,
  BuscadorIcono,
  PaloDeAmasarIcono,
} from "../../../assets/Icons";
import { Hammer, Package, Search, ArrowRight } from "lucide-react";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ContenedorSeccion from "../../ContenidoPanel/ContenedorSeccion";

/**
 * ProduccionSeleccionPage: Interfaz para seleccionar que producto se va a producir.
 */
const ProduccionSeleccionPage = () => {
  const navigate = useNavigate();
  const { data: queryData, isLoading } = useObtenerProductos({});
  const [searchTerm, setSearchTerm] = useState("");

  const productos = useMemo(() => {
    return Array.isArray(queryData?.data) ? queryData.data : [];
  }, [queryData]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return productos;
    return productos.filter(
      (item) =>
        item.nombre?.toLowerCase().includes(term) ||
        String(item.codigo).includes(term),
    );
  }, [searchTerm, productos]);

  return (
    <ContenedorSeccion>
      <EncabezadoSeccion
        ruta="Nueva Producción > Seleccionar Producto"
        icono={<ProduccionIcono size={20} />}
        volver={true}
        redireccionAnterior={-1}
      />

      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* Search Header */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-neutral-text-muted)] group-focus-within:text-[var(--color-brand-primary)] z-10 transition-colors">
            <BuscadorIcono size={18} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar producto por nombre o código para iniciar producción..."
            className="w-full bg-white border border-[var(--color-neutral-border)] rounded-[12px] pl-12 pr-4 py-4 text-[14px] text-[var(--color-neutral-text-main)] focus:outline-none focus:border-[var(--color-brand-primary)] shadow-sm placeholder:text-[var(--color-neutral-text-muted)] font-medium transition-colors"
          />
        </div>

        {/* Grid of Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-50 border border-[var(--color-neutral-border)] rounded-[12px] animate-pulse"
              />
            ))
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full py-20 bg-gray-50 border border-dashed border-[var(--color-neutral-border)] rounded-[12px] flex flex-col items-center justify-center text-[var(--color-neutral-text-muted)]">
              <Package size={40} strokeWidth={1.5} className="mb-2 text-[var(--color-neutral-border)]" />
              <p className="text-[13px] font-bold uppercase tracking-wide">
                No se encontraron productos
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.codigo}
                onClick={() =>
                  navigate(
                    `/panel/inventario/produccion/${item.codigo}`,
                  )
                }
                className="group bg-white border border-[var(--color-neutral-border)] hover:border-[var(--color-brand-primary)] rounded-[12px] p-4 flex items-center justify-between cursor-pointer hover:shadow-md active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[10px] bg-[var(--color-brand-soft)] flex items-center justify-center text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/20 group-hover:bg-[var(--color-brand-primary)] group-hover:text-white transition-colors">
                    <PaloDeAmasarIcono size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-mono text-[var(--color-neutral-text-muted)] uppercase">
                        #{item.codigo.toString().padStart(3, "0")}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-[var(--color-neutral-border)]" />
                      <span className="text-[11px] font-bold text-[var(--color-brand-primary)] uppercase tracking-wide">
                        {item.unidadMedida}
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold text-[var(--color-neutral-text-main)] uppercase group-hover:text-[var(--color-brand-primary)] line-clamp-1 transition-colors">
                      {item.nombre}
                    </h3>
                    <p className="text-[13px] text-[var(--color-neutral-text-muted)] font-medium">
                      Stock Actual:{" "}
                      <span className="text-[var(--color-neutral-text-main)] font-semibold">{item.stock || 0}</span>
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded-[8px] bg-gray-50 text-[var(--color-neutral-text-muted)] group-hover:bg-[var(--color-brand-soft)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                  <ArrowRight size={16} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 border border-[var(--color-neutral-border)] rounded-[16px] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[12px] border border-[var(--color-brand-primary)]/20 flex items-center justify-center bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)]">
              <PaloDeAmasarIcono size={24} />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[var(--color-neutral-text-main)] uppercase tracking-wide">
                Módulo de Manufactura
              </h4>
              <p className="text-[13px] text-[var(--color-neutral-text-muted)] max-w-md mt-1">
                Seleccione un artículo terminado para desglosar sus insumos y
                registrar un nuevo lote en el inventario.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/panel/inventario/produccion/reporte")}
            className="px-6 py-3 bg-white hover:bg-gray-50 border border-[var(--color-neutral-border)] rounded-[10px] text-[13px] font-bold text-[var(--color-neutral-text-main)] uppercase tracking-wide shadow-sm transition-colors cursor-pointer active:scale-95 whitespace-nowrap"
          >
            Ver Historial Completo
          </button>
        </div>
      </div>
    </ContenedorSeccion>
  );
};

export default ProduccionSeleccionPage;
