import React from "react";
import DataTable from "../../UI/DataTable/DataTable";
import { columnasSecciones } from "./RolesPermisos/ColumnasSecciones";
import { accionesReutilizables } from "../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesSecciones = ({ handleEditarClick, handleEliminarClick }) => [
  { ...accionesReutilizables.editar, onClick: (fila) => handleEditarClick(fila) },
  { ...accionesReutilizables.eliminar, onClick: (fila) => handleEliminarClick(fila) },
];

const TablaSecciones = ({
  secciones,
  cargando,
  busqueda,
  onRefrescar,
  handleEditarClick,
  handleEliminarClick,
}) => {
  return (
    <div className="bg-white rounded-md border border-black/5 shadow-sm overflow-hidden">
      <DataTable
        columnas={columnasSecciones(busqueda)}
        acciones={accionesSecciones({ handleEditarClick, handleEliminarClick })}
        datos={secciones || []}
        cargando={cargando}
        titulo="Gestión de Secciones"
        subtitulo="Módulos y vistas principales de la plataforma"
        busqueda={busqueda}
        onRefrescar={onRefrescar}
        alturaFija={600}
      />
    </div>
  );
};

export default TablaSecciones;
