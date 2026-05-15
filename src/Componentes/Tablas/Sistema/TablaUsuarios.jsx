import React from "react";
import DataTable from "../../UI/DataTable/DataTable";
import { columnasUsuarios } from "./ColumnasUsuarios";
import { accionesUsuarios } from "./AccionesUsuarios";

const TablaUsuarios = ({
  usuarios,
  cargando,
  busqueda,
  onRefrescar,
  handleEditarClick,
  handleEliminarClick,
  handleVincularRolUsuarioClick,
  handleVincularUnidadesClick,
}) => {
  return (
    <div className="bg-white rounded-md border border-black/5 shadow-sm overflow-hidden">
      <DataTable
        columnas={columnasUsuarios(busqueda)}
        acciones={accionesUsuarios({
          handleEditarClick,
          handleEliminarClick,
          handleVincularRolUsuarioClick,
          handleVincularUnidadesClick,
        })}
        datos={usuarios || []}
        cargando={cargando}
        titulo="Gestión de Usuarios"
        subtitulo="Control de accesos y perfiles de usuario del sistema"
        busqueda={busqueda}
        onRefrescar={onRefrescar}
        alturaFija={600}
        seleccionable={true}
        onSeleccionCambio={(seleccionados) => console.log("Usuarios seleccionados:", seleccionados)}
      />
    </div>
  );
};

export default TablaUsuarios;
