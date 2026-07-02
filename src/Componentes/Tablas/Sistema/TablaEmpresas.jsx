import React from "react";
import DataTable from "../../UI/DataTable/DataTable";
import { columnasEmpresas } from "./ColumnasEmpresas";
import { accionesEmpresas } from "./AccionesEmpresa";
import { usePermisosDeUsuario } from "../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";

const TablaEmpresas = ({
  empresas,
  cargando,
  busqueda,
  onRefrescar,
  handleUsuariosClick,
  handleUnidadesClick,
  handleRolesClick,
  handleEditarClick,
  handleDuplicarClick,
  handleEliminarClick,
  handleConfigurarCamposClick,
  handlePuntosVentaClick,
  handleLogsArcaClick,
}) => {
  const { tieneAccion } = usePermisosDeUsuario();

  return (
    <div className="bg-white rounded-md border border-black/5 shadow-sm overflow-hidden">
      <DataTable
        columnas={columnasEmpresas(busqueda)}
        acciones={accionesEmpresas({
          handleUsuariosClick,
          handleUnidadesClick,
          handleRolesClick,
          handleConfigurarCamposClick,
          handleEditarClick,
          handleDuplicarClick,
          handleEliminarClick,
          handlePuntosVentaClick,
          handleLogsArcaClick,
          tieneAccion,
        })}
        datos={empresas || []}
        cargando={cargando}
        titulo="Gestión de Empresas"
        subtitulo="Administración central de organizaciones y parámetros de acceso"
        busqueda={busqueda}
        onRefrescar={onRefrescar}
        alturaFija={600}
      />
    </div>
  );
};

export default TablaEmpresas;
