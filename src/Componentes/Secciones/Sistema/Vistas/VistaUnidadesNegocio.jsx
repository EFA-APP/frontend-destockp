import React, { useState } from "react";
import TablaUnidadesNegocio from "../../../Tablas/Sistema/TablaUnidadesNegocio";
import ModalCrearUnidadNegocio from "../../../Modales/Sistema/ModalCrearUnidadNegocio";
import { useObtenerUnidadesNegocio } from "../../../../Backend/Autenticacion/queries/UnidadNegocio/useObtenerUnidadesNegocio.query";
import { useEliminarUnidadNegocio } from "../../../../Backend/Autenticacion/queries/UnidadNegocio/useEliminarUnidadNegocio.mutation";
import { AgregarIcono, VolverIcono } from "../../../../assets/Icons";

const VistaUnidadesNegocio = ({ empresa, onClose }) => {
  const [busqueda, setBusqueda] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unidadAEditar, setUnidadAEditar] = useState(null);

  const { data: unidades, isLoading, refetch } = useObtenerUnidadesNegocio({
    codigoEmpresa: empresa.codigo || empresa.codigo,
  });

  const { mutateAsync: eliminarUnidad } = useEliminarUnidadNegocio();

  const handleCrearNuevo = () => {
    setUnidadAEditar(null);
    setIsModalOpen(true);
  };

  const handleEditar = (unidad) => {
    setUnidadAEditar(unidad);
    setIsModalOpen(true);
  };

  const handleEliminar = async (unidad) => {
    if (window.confirm(`¿Estás seguro de eliminar la unidad "${unidad.nombre}"?`)) {
      try {
        await eliminarUnidad({
          codigo: unidad.codigo,
          codigoEmpresa: Number(empresa.codigo || empresa.codigo),
        });
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* HEADER DE LA VISTA */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-all group"
          >
            <VolverIcono size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-black uppercase leading-none">
              Unidades de Negocio
            </h1>
            <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase mt-1">
              Sucursales y verticales de <span className="text-black">{empresa.nombre}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleCrearNuevo}
          className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-md text-[12px] font-black uppercase tracking-widest shadow-xl hover:bg-black/80 hover:-translate-y-1 transition-all active:scale-95"
        >
          <AgregarIcono size={16} />
          Nueva Unidad
        </button>
      </div>

      {/* FILTROS Y BUSQUEDA */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="BUSCAR POR NOMBRE O CÓDIGO..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/20 transition-all shadow-sm"
          />
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-black/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 overflow-hidden">
        <TablaUnidadesNegocio
          unidades={unidades}
          cargando={isLoading}
          busqueda={busqueda}
          onRefrescar={refetch}
          handleEditarClick={handleEditar}
          handleEliminarClick={handleEliminar}
        />
      </div>

      {/* MODAL */}
      <ModalCrearUnidadNegocio
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        empresa={empresa}
        unidadAEditar={unidadAEditar}
      />
    </div>
  );
};

export default VistaUnidadesNegocio;
