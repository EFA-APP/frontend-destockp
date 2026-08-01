import React, { useState } from "react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import DataTable from "../../../UI/DataTable/DataTable";
import ModalBanner from "../../../Modales/Camara/ModalBanner";
import ModalConfirmacion from "../../../UI/ModalConfirmacion/ModalConfirmacion";
import { columnasBanners } from "../../../Tablas/Camara/ColumnasBanners";
import { useBanners } from "../../../../Backend/Camara/hooks/useBanners";

const Banners = () => {
  const { 
    banners, 
    cargandoBanners, 
    crearBanner, 
    actualizarBanner, 
    eliminarBanner 
  } = useBanners();

  const [modalBanner, setModalBanner] = useState({ isOpen: false, data: null });
  const [modalEliminar, setModalEliminar] = useState({ isOpen: false, id: null });

  const handleCrear = () => setModalBanner({ isOpen: true, data: null });
  const handleEditar = (row) => setModalBanner({ isOpen: true, data: row });
  const handleEliminar = (row) => setModalEliminar({ isOpen: true, id: row.id });

  const handleSubmit = async (data) => {
    if (modalBanner.data) {
      await actualizarBanner({ id: modalBanner.data.id, dto: data });
    } else {
      await crearBanner(data);
    }
    setModalBanner({ isOpen: false, data: null });
  };

  const handleConfirmarEliminar = async () => {
    await eliminarBanner(modalEliminar.id);
    setModalEliminar({ isOpen: false, id: null });
  };

  const accionesTabla = [
    { label: "Editar", action: handleEditar },
    { label: "Eliminar", action: handleEliminar, isDanger: true },
  ];

  return (
    <div className="flex flex-col h-full bg-gris-100">
      <EncabezadoSeccion
        titulo="Banners"
        onCrear={handleCrear}
        textoBotonCrear="Nuevo Banner"
      />
      
      <div className="p-6 flex-1 flex flex-col gap-4">
        <div className="flex-1 min-h-0 bg-white rounded-lg shadow-sm border border-gris-200">
          <DataTable
            datos={banners}
            columnas={columnasBanners}
            loading={cargandoBanners}
            acciones={accionesTabla}
            placeholderBuscador="Buscar banner..."
          />
        </div>
      </div>

      <ModalBanner
        isOpen={modalBanner.isOpen}
        onClose={() => setModalBanner({ isOpen: false, data: null })}
        registroAEditar={modalBanner.data}
        onSubmit={handleSubmit}
      />

      <ModalConfirmacion
        isOpen={modalEliminar.isOpen}
        onClose={() => setModalEliminar({ isOpen: false, id: null })}
        onConfirm={handleConfirmarEliminar}
        title="Eliminar Banner"
        message="¿Está seguro que desea eliminar este banner? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default Banners;
