import React, { useState } from "react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import DataTable from "../../../UI/DataTable/DataTable";
import Select from "../../../UI/Select/Select";
import ModalContenido from "../../../Modales/Camara/ModalContenido";
import ModalConfirmacion from "../../../UI/ModalConfirmacion/ModalConfirmacion";
import { columnasContenidos, ETIQUETA_TIPO_CONTENIDO } from "../../../Tablas/Camara/ColumnasContenidos";
import { useContenidos } from "../../../../Backend/Camara/hooks/useContenidos";

const ContenidosInstitucionales = () => {
  const [filtroTipo, setFiltroTipo] = useState("");
  const { 
    contenidos, 
    cargandoContenidos, 
    crearContenido, 
    actualizarContenido, 
    eliminarContenido 
  } = useContenidos(filtroTipo ? { tipo: filtroTipo } : {});

  const [modalContenido, setModalContenido] = useState({ isOpen: false, data: null });
  const [modalEliminar, setModalEliminar] = useState({ isOpen: false, id: null });

  const handleCrear = () => setModalContenido({ isOpen: true, data: null });
  const handleEditar = (row) => setModalContenido({ isOpen: true, data: row });
  const handleEliminar = (row) => setModalEliminar({ isOpen: true, id: row.id });

  const handleSubmit = async (data) => {
    if (modalContenido.data) {
      await actualizarContenido({ id: modalContenido.data.id, dto: data });
    } else {
      await crearContenido(data);
    }
    setModalContenido({ isOpen: false, data: null });
  };

  const handleConfirmarEliminar = async () => {
    await eliminarContenido(modalEliminar.id);
    setModalEliminar({ isOpen: false, id: null });
  };

  const accionesTabla = [
    { label: "Editar", action: handleEditar },
    { label: "Eliminar", action: handleEliminar, isDanger: true },
  ];

  return (
    <div className="flex flex-col h-full bg-gris-100">
      <EncabezadoSeccion
        titulo="Contenidos Institucionales"
        onCrear={handleCrear}
        textoBotonCrear="Nuevo Contenido"
      />
      
      <div className="p-6 flex-1 flex flex-col gap-4">
        <div className="flex gap-4">
          <Select
            label="Filtrar por Tipo"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            options={[
              { value: "", label: "Todos" },
              { value: "NOTICIA", label: ETIQUETA_TIPO_CONTENIDO.NOTICIA },
              { value: "SERVICIO", label: ETIQUETA_TIPO_CONTENIDO.SERVICIO },
              { value: "CAMPANA", label: ETIQUETA_TIPO_CONTENIDO.CAMPANA },
            ]}
          />
        </div>

        <div className="flex-1 min-h-0 bg-white rounded-lg shadow-sm border border-gris-200">
          <DataTable
            datos={contenidos}
            columnas={columnasContenidos}
            loading={cargandoContenidos}
            acciones={accionesTabla}
            placeholderBuscador="Buscar contenido..."
          />
        </div>
      </div>

      <ModalContenido
        isOpen={modalContenido.isOpen}
        onClose={() => setModalContenido({ isOpen: false, data: null })}
        registroAEditar={modalContenido.data}
        onSubmit={handleSubmit}
      />

      <ModalConfirmacion
        isOpen={modalEliminar.isOpen}
        onClose={() => setModalEliminar({ isOpen: false, id: null })}
        onConfirm={handleConfirmarEliminar}
        title="Eliminar Contenido"
        message="¿Está seguro que desea eliminar este contenido? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default ContenidosInstitucionales;
