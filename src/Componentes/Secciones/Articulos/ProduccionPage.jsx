import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductoUI } from "../../../Backend/Articulos/hooks/Producto/useProductoUI";
import { ProduccionIcono } from "../../../assets/Icons";
import ContenedorSeccion from "../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ModalProduccion from "../../Modales/Articulos/ModalProduccion";
import { Hammer, Package, Layers } from "lucide-react";

/**
 * ProduccionPage: Ruta independiente para registro de lotes de producción.
 */
const ProduccionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { productos, cargando } = useProductoUI();
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    if (productos.length > 0) {
      const found = productos.find((p) => String(p.codigoSecuencial) === id);
      if (found) setProducto(found);
    }
  }, [id, productos]);

  if (cargando && !producto) {
    return (
      <ContenedorSeccion className="flex items-center justify-center p-20">
        <div className="text-[var(--color-brand-primary)] font-bold tracking-wide">
          Sincronizando Datos de Producción...
        </div>
      </ContenedorSeccion>
    );
  }

  if (!producto && !cargando) {
    return (
      <ContenedorSeccion className="p-8">
        <div className="bg-rose-50 border border-rose-200 rounded-[12px] p-8 text-center shadow-sm">
          <p className="text-rose-600 font-bold uppercase tracking-wide mb-2">
            Producto no identificado
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-[var(--color-neutral-text-muted)] hover:text-[var(--color-neutral-text-main)] underline font-semibold mt-4 transition-colors"
          >
            Regresar
          </button>
        </div>
      </ContenedorSeccion>
    );
  }

  return (
    <ContenedorSeccion className="px-3 py-2">
      {/* Elegant Header Card */}
      <div className="bg-white border border-[var(--color-neutral-border)] shadow-sm rounded-[16px] mb-6 overflow-hidden">
        <EncabezadoSeccion
          ruta={`Producción`}
          icono={<ProduccionIcono size={18} className="text-[var(--color-brand-primary)]" />}
          volver={true}
          redireccionAnterior={-1}
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        {/* Hero Insight Section (Mini) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white border border-[var(--color-neutral-border)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[12px] p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-[var(--color-brand-soft)] rounded-[10px] text-[var(--color-brand-primary)]">
              <Hammer size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--color-neutral-text-muted)] uppercase tracking-wide">
                Operación
              </p>
              <h3 className="text-[14px] font-bold text-[var(--color-neutral-text-main)] uppercase">
                Registro de Lote
              </h3>
            </div>
          </div>

          <div className="bg-white border border-[var(--color-neutral-border)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[12px] p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-gray-50 rounded-[10px] text-[var(--color-neutral-text-muted)]">
              <Package size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--color-neutral-text-muted)] uppercase tracking-wide">
                Existencia
              </p>
              <h3 className="text-[14px] font-bold text-[var(--color-neutral-text-main)] uppercase">
                {producto?.stock || 0}{" "}
                <span className="text-[12px] text-[var(--color-neutral-text-muted)] font-medium">
                  {producto?.unidadMedida}
                </span>
              </h3>
            </div>
          </div>

          <div className="bg-white border border-[var(--color-neutral-border)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[12px] p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-gray-50 rounded-[10px] text-[var(--color-neutral-text-muted)]">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--color-neutral-text-muted)] uppercase tracking-wide">
                Referencia
              </p>
              <h3 className="text-[14px] font-bold text-[var(--color-neutral-text-main)] uppercase">
                SKU: #{producto?.codigoSecuencial?.toString().padStart(3, "0")}
              </h3>
            </div>
          </div>
        </div>

        {/* Main Action Container */}
        <div className="bg-white border border-[var(--color-neutral-border)] rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 md:p-6">
            <ModalProduccion
              open={true}
              onClose={() => navigate(-1)}
              articulo={producto}
              isStandalone={true}
            />
          </div>
        </div>
      </div>
    </ContenedorSeccion>
  );
};

export default ProduccionPage;
