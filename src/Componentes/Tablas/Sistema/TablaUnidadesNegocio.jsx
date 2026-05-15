import React from "react";
import DataTable from "../../UI/DataTable/DataTable";
import { columnasUnidadesNegocio } from "./ColumnasUnidadesNegocio";
import { accionesUnidadesNegocio } from "./AccionesUnidadesNegocio";

const TablaUnidadesNegocio = ({
  unidades,
  cargando,
  busqueda,
  onRefrescar,
  handleEditarClick,
  handleEliminarClick,
}) => {
  return (
    <div className="bg-white rounded-md border border-black/5 shadow-sm overflow-hidden">
      <DataTable
        columnas={columnasUnidadesNegocio(busqueda)}
        acciones={accionesUnidadesNegocio({
          handleEditarClick,
          handleEliminarClick,
        })}
        datos={unidades || []}
        cargando={cargando}
        error={null}
        onRefrescar={onRefrescar}
        nombreTabla="Unidades de Negocio"
        idTabla="unidades-negocio-admin"
      />
    </div>
  );
};

export default TablaUnidadesNegocio;
