import React from "react";
import DataTable from "../../UI/DataTable/DataTable";
import { columnasRoles } from "./ColumnasRoles";
import { accionesRoles } from "./AccionesRoles";

const TablaRoles = ({
  roles,
  cargando,
  busqueda,
  onRefrescar,
  handleEditarClick,
  handleEliminarClick,
  handleGestionarUsuariosClick,
  handleVincularPermisosClick,
}) => {
  return (
    <div className="bg-white rounded-md border border-black/5 shadow-sm overflow-hidden">
      <DataTable
        columnas={columnasRoles(busqueda)}
        acciones={accionesRoles({
          handleEditarClick,
          handleEliminarClick,
          handleGestionarUsuariosClick,
          handleVincularPermisosClick,
        })}
        datos={roles || []}
        cargando={cargando}
        titulo="Gestión de Roles y Accesos"
        subtitulo="Administración de perfiles de seguridad y niveles de permiso"
        busqueda={busqueda}
        onRefrescar={onRefrescar}
        alturaFija={600}
      />
    </div>
  );
};

export default TablaRoles;
