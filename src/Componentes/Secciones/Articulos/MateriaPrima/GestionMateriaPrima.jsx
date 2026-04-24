import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMateriaPrimaUI } from "../../../../Backend/Articulos/hooks/MateriaPrima/useMateriaPrimaUI";
import {
  CanastaIcono,
  HistorialIcono,
  VentasIcono,
  ComprobanteIcono,
  MovimientoIcono,
} from "../../../../assets/Icons";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import materiaPrimaConfig from "../../../Modales/Articulos/ConfigMateriaPrima";
import ModalMovimiento from "../../../Modales/Articulos/ModalMovimiento";
import ListaMovimientos from "../../../UI/ListaMovimientos/ListaMovimientos";

const GestionMateriaPrima = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { materiasPrimas, actualizarMateriaPrima, cargando } =
    useMateriaPrimaUI();
  const [materiaPrima, setMateriaPrima] = useState(
    location.state?.materiaPrima || null,
  );
  const [activeTab, setActiveTab] = useState(location.state?.tab || "info");

  useEffect(() => {
    if (!materiaPrima && materiasPrimas.length > 0) {
      const found = materiasPrimas.find(
        (p) => String(p.codigoSecuencial) === id,
      );
      if (found) setMateriaPrima(found);
    }
  }, [id, materiasPrimas, materiaPrima]);

  const tabs = [
    { id: "info", label: "Información", icon: <ComprobanteIcono size={16} /> },
    { id: "editar", label: "Editar", icon: <CanastaIcono size={16} /> },
    { id: "historial", label: "Historial", icon: <HistorialIcono size={16} /> },
  ];

  if (!materiaPrima && cargando) {
    return (
      <ContenedorSeccion className="flex items-center justify-center p-20">
        <div className=" text-[var(--primary)] font-black uppercase tracking-widest text-[12px]">
          Cargando Materia Prima...
        </div>
      </ContenedorSeccion>
    );
  }

  if (!materiaPrima) {
    return (
      <ContenedorSeccion className="p-8">
        <div className="bg-rose-700/10 border border-rose-700/20 rounded-md! p-8 text-center">
          <p className="text-rose-700 font-black uppercase tracking-widest mb-2 text-[12px]">
            Materia Prima no encontrada
          </p>
          <button
            onClick={() => navigate("/panel/inventario/materia-prima")}
            className="text-black/60 hover:text-black underline font-bold mt-4 text-[12px] uppercase cursor-pointer"
          >
            Volver al listado
          </button>
        </div>
      </ContenedorSeccion>
    );
  }

  return (
    <ContenedorSeccion className="px-3 py-2">
      <div className="card no-inset no-ring bg-[var(--surface)] shadow-md rounded-md! mb-4 overflow-hidden">
        <EncabezadoSeccion
          ruta={`Materia Prima: ${materiaPrima.nombre}`}
          icono={<CanastaIcono size={18} />}
          volver={true}
          redireccionAnterior={"/panel/inventario/materia-prima"}
        />
      </div>

      {/* Compact Formal Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1 p-1! bg-black/20! border! border-black/5! rounded-t-md! backdrop-blur-md! self-start shadow-inner!">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative flex items-center gap-2 px-4 py-2 rounded-md! text-[11px] font-black uppercase tracking-[0.1em] ! ! overflow-hidden! cursor-pointer! ${
              activeTab === tab.id
                ? "text-[var(--primary)]! bg-[var(--primary)]/10! border! border-[var(--primary)]/20! shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]!"
                : "text-black/30! hover:text-black/70! hover:bg-white/[0.03]! border! border-transparent!"
            }`}
          >
            <span
              className={`! ! scale-75 ${activeTab === tab.id ? "scale-90! text-[var(--primary)]!" : "!"}`}
            >
              {tab.icon}
            </span>
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary)]! ! ! !" />
            )}
          </button>
        ))}
      </div>

      <div className="    bg-[var(--surface)] p-2 rounded-md!">
        {/* Tab Content: INFO & EDIT */}
        {(activeTab === "info" || activeTab === "editar") && (
          <div className="max-w-[720px] mx-auto">
            <ModalDetalleGenerico
              open={true}
              accentColor="purple"
              isStandalone={true}
              hideTabs={activeTab === "info"}
              onClose={() => navigate("/panel/inventario/materia-prima")}
              mode={activeTab === "editar" ? "editar" : "view"}
              data={materiaPrima}
              {...materiaPrimaConfig}
              initialTab="info"
              width="w-full"
              onSave={async (dataEditada) => {
                const { codigoSecuencial, codigoEmpresa, id, ...payload } =
                  dataEditada;

                if (payload.stock !== undefined)
                  payload.stock = parseFloat(payload.stock) || 0;
                if (payload.cantidadPorPaquete !== undefined) {
                  payload.cantidadPorPaquete = payload.cantidadPorPaquete
                    ? parseFloat(payload.cantidadPorPaquete)
                    : null;
                }

                try {
                  await actualizarMateriaPrima(
                    materiaPrima.codigoSecuencial,
                    payload,
                  );
                  navigate("/panel/inventario/materia-prima");
                } catch (err) {
                  console.error("Error updating raw material:", err);
                }
              }}
            >
              <ListaMovimientos
                codigoArticulo={materiaPrima?.codigoSecuencial}
                tipoArticulo="MATERIA_PRIMA"
              />
            </ModalDetalleGenerico>
          </div>
        )}

        {activeTab === "historial" && (
          <div className="max-w-[720px] mx-auto bg-transparent!">
            <div className="flex items-center gap-2 mb-4 p-3 rounded-md! bg-zinc-900/30 border border-black/5 shadow-inner">
              <div className="w-8 h-8 rounded-md! bg-amber-700/10 flex items-center justify-center border border-amber-700/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <HistorialIcono size={16} color="var(--primary)" />
              </div>
              <div>
                <h3 className="text-sm font-black text-black uppercase tracking-wider">
                  Historial
                </h3>
                <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">
                  Traza de operaciones
                </p>
              </div>
            </div>
            <ListaMovimientos
              codigoArticulo={materiaPrima?.codigoSecuencial}
              tipoArticulo="MATERIA_PRIMA"
            />
          </div>
        )}
      </div>
    </ContenedorSeccion>
  );
};

export default GestionMateriaPrima;
