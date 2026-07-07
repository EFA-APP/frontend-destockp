import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProductoUI } from "../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import {
  InventarioIcono,
  HistorialIcono,
  ComprobanteIcono,
} from "../../../../assets/Icons";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import productoConfig from "../../../Modales/Articulos/ConfigProducto";
import ListaMovimientos from "../../../UI/ListaMovimientos/ListaMovimientos";

const GestionProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { productos, actualizarProducto, cargando } = useProductoUI();
  const [producto, setProducto] = useState(location.state?.producto || null);
  const [activeTab, setActiveTab] = useState(location.state?.tab || "info");

  useEffect(() => {
    if (!producto && productos.length > 0) {
      const found = productos.find((p) => String(p.codigoSecuencial) === id);
      if (found) setProducto(found);
    }
  }, [id, productos, producto]);

  const tabs = [
    { id: "info", label: "Información", icon: <ComprobanteIcono size={16} /> },
    { id: "editar", label: "Editar", icon: <InventarioIcono size={16} /> },
    { id: "historial", label: "Historial", icon: <HistorialIcono size={16} /> },
  ];

  if (!producto && cargando) {
    return (
      <ContenedorSeccion className="flex items-center justify-center p-20">
        <div className=" text-[var(--primary)] font-black uppercase tracking-widest">
          Cargando Producto...
        </div>
      </ContenedorSeccion>
    );
  }

  if (!producto) {
    return (
      <ContenedorSeccion className="p-8">
        <div className="bg-rose-50 border border-rose-200 rounded-[12px] p-8 text-center">
          <p className="text-rose-700 font-semibold uppercase tracking-wide mb-2">
            Producto no encontrado
          </p>
          <button
            onClick={() => navigate("/panel/inventario/productos")}
            className="text-[var(--color-neutral-text-main)] hover:text-[var(--color-brand-primary)] underline font-semibold mt-4 transition-colors"
          >
            Volver al listado
          </button>
        </div>
      </ContenedorSeccion>
    );
  }

  return (
    <ContenedorSeccion className="px-3 py-2">
      <div className="bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[var(--color-neutral-border)] rounded-[16px] mb-4 overflow-hidden">
        <EncabezadoSeccion
          ruta={`Producto: ${producto.nombre}`}
          icono={<InventarioIcono size={18} />}
          volver={true}
          redireccionAnterior={"/panel/inventario/productos"}
        />
      </div>

      {/* Compact Formal Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-50 border border-[var(--color-neutral-border)] rounded-t-[12px] self-start shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[12px] font-semibold tracking-wide overflow-hidden cursor-pointer transition-colors ${
              activeTab === tab.id
                ? "text-[var(--color-brand-primary)] bg-white shadow-sm border border-[var(--color-neutral-border)]"
                : "text-[var(--color-neutral-text-muted)] hover:text-[var(--color-neutral-text-main)] hover:bg-gray-100 border border-transparent"
            }`}
          >
            <span
              className={`scale-90 transition-transform ${activeTab === tab.id ? "scale-100 text-[var(--color-brand-primary)]" : ""}`}
            >
              {tab.icon}
            </span>
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-brand-primary)]" />
            )}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[var(--color-neutral-border)] border-t-0 p-4 rounded-b-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        {/* Tab Content: INFO & EDIT */}
        {(activeTab === "info" || activeTab === "editar") && (
          <div className="max-w-[720px] mx-auto">
            <ModalDetalleGenerico
              open={true}
              accentColor="emerald"
              isStandalone={true}
              hideTabs={activeTab === "info"}
              onClose={() => navigate("/panel/inventario/productos")}
              mode={activeTab === "editar" ? "editar" : "view"}
              data={producto}
              {...productoConfig}
              initialTab="info"
              width="w-full"
              onSave={async (dataEditada) => {
                const { codigoSecuencial, codigoEmpresa, id, ...payload } =
                  dataEditada;

                // Numerical types
                if (payload.stock !== undefined)
                  payload.stock = parseFloat(payload.stock) || 0;
                if (payload.cantidadPorPaquete !== undefined)
                  payload.cantidadPorPaquete =
                    parseFloat(payload.cantidadPorPaquete) || 0;

                // Boolean type
                if (payload.activo !== undefined)
                  payload.activo = !!payload.activo;

                try {
                  await actualizarProducto(producto.codigoSecuencial, payload);
                  // Force redirect or update
                  navigate("/panel/inventario/productos");
                } catch (err) {
                  console.error("Error updating product:", err);
                }
              }}
            >
              {activeTab === "editar" && (
                <ListaMovimientos
                  codigoArticulo={producto?.codigoSecuencial}
                  tipoArticulo="PRODUCTO"
                />
              )}
            </ModalDetalleGenerico>
          </div>
        )}

        {activeTab === "historial" && (
          <div className="max-w-[720px] mx-auto bg-transparent">
            <div className="flex items-center gap-3 mb-5 p-4 rounded-[12px] bg-gray-50 border border-[var(--color-neutral-border)] shadow-sm">
              <div className="w-10 h-10 rounded-[10px] bg-amber-50 flex items-center justify-center border border-amber-100">
                <HistorialIcono size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-[var(--color-neutral-text-main)] uppercase tracking-wide">
                  Historial
                </h3>
                <p className="text-[12px] text-[var(--color-neutral-text-muted)] font-medium mt-0.5">
                  Traza de operaciones
                </p>
              </div>
            </div>
            <ListaMovimientos
              codigoArticulo={producto?.codigoSecuencial}
              tipoArticulo="PRODUCTO"
            />
          </div>
        )}
      </div>
    </ContenedorSeccion>
  );
};

export default GestionProducto;
