import DataTable from "../../UI/DataTable/DataTable";
import { columnasPermisos } from "./RolesPermisos/ColumnasPermisos";
import { accionesReutilizables } from "../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesPermisos = ({
  handleEditarClick,
  handleEliminarClick,
  handleGestionarAcciones,
}) => [
  {
    ...accionesReutilizables.gestionarAcciones,
    onClick: (fila) => handleGestionarAcciones(fila),
  },
  {
    ...accionesReutilizables.editar,
    onClick: (fila) => handleEditarClick(fila),
  },
  {
    ...accionesReutilizables.eliminar,
    onClick: (fila) => handleEliminarClick(fila),
  },
];

const TablaPermisos = ({
  permisos,
  cargando,
  busqueda,
  onRefrescar,
  handleEditarClick,
  handleEliminarClick,
  handleGestionarAcciones,
}) => {
  return (
    <div className="bg-white rounded-md border border-black/5 shadow-sm overflow-hidden">
      <DataTable
        columnas={columnasPermisos(busqueda)}
        acciones={accionesPermisos({
          handleEditarClick,
          handleEliminarClick,
          handleGestionarAcciones,
        })}
        datos={permisos || []}
        cargando={cargando}
        titulo="Gestión de Permisos"
        subtitulo="Listado de permisos y accesos granulares"
        busqueda={busqueda}
        onRefrescar={onRefrescar}
        alturaFija={600}
      />
    </div>
  );
};

export default TablaPermisos;
