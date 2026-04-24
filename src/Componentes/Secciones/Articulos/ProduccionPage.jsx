import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductoUI } from "../../../Backend/Articulos/hooks/Producto/useProductoUI";
import { ProduccionIcono, InventarioIcono } from "../../../assets/Icons";
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
        <div className=" text-purple-700 font-black uppercase tracking-widest">
          Sincronizando Datos de Producción...
        </div>
      </ContenedorSeccion>
    );
  }

  if (!producto && !cargando) {
    return (
      <ContenedorSeccion className="p-8">
        <div className="bg-rose-700/10 border border-rose-700/20 rounded-md p-8 text-center   ">
          <p className="text-rose-700 font-black uppercase tracking-widest mb-2">
            Producto no identificado
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-black/60 hover:text-black underline font-bold mt-4 cursor-pointer"
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
      <div className="card no-inset no-ring bg-[var(--surface)] shadow-md rounded-md! mb-6 overflow-hidden">
        <EncabezadoSeccion
          ruta={`Producción > ${producto?.nombre || "Cargando..."}`}
          icono={<ProduccionIcono size={18} />}
          volver={true}
          redireccionAnterior={-1}
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-6     pb-20">
        {/* Hero Insight Section (Mini) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-purple-600/5 border border-purple-700/10 rounded-md p-4 flex items-center gap-4 group hover:bg-purple-600/10  ">
            <div className="p-3 bg-purple-600/10 rounded-md text-purple-700  ">
              <Hammer size={20} />
            </div>
            <div>
              <p className="text-[12px] font-black text-black/85 uppercase tracking-widest">
                Operación
              </p>
              <h3 className="text-sm font-bold text-black uppercase italic">
                Registro de Lote
              </h3>
            </div>
          </div>

          <div className="bg-white/2[0.02] border border-black/5 rounded-md p-4 flex items-center gap-4">
            <div className="p-3 bg-black/5 rounded-md text-black/40">
              <Package size={20} />
            </div>
            <div>
              <p className="text-[12px] font-black text-black/85 uppercase tracking-widest">
                Existencia
              </p>
              <h3 className="text-sm font-bold text-black uppercase">
                {producto?.stock || 0}{" "}
                <span className="text-[12px] opacity-40">
                  {producto?.unidadMedida}
                </span>
              </h3>
            </div>
          </div>

          <div className="bg-white/2[0.02] border border-black/5 rounded-md p-4 flex items-center gap-4">
            <div className="p-3 bg-black/5 rounded-md text-black/40">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-[12px] font-black text-black/85 uppercase tracking-widest">
                Referencia
              </p>
              <h3 className="text-sm font-bold text-black uppercase">
                SKU: #{producto?.codigoSecuencial?.toString().padStart(3, "0")}
              </h3>
            </div>
          </div>
        </div>

        {/* Main Action Container */}
        <div className="bg-[var(--surface)] border border-black/5 rounded-md shadow-2xl overflow-hidden">
          <div className="bg-purple-600/10 px-6 py-3 border-b border-black/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-700 " />
            <span className="text-[12px] font-black text-purple-400 uppercase tracking-[0.2em]">
              Configuración de Insumos & Escandallo
            </span>
          </div>

          <div className="p-2 md:p-4">
            <ModalProduccion
              open={true}
              onClose={() => navigate(-1)}
              articulo={producto}
              isStandalone={true}
            />
          </div>
        </div>

        <p className="text-center text-[11px] text-black/85 font-bold uppercase tracking-[0.3em] mt-8">
          Sistema de Gestión de Manufactura DeStockP
        </p>
      </div>
    </ContenedorSeccion>
  );
};

export default ProduccionPage;
