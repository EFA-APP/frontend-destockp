import { accionesReutilizables } from "../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesRoles = ({
  handleEditarClick,
  handleEliminarClick,
  handleGestionarUsuariosClick,
  handleVincularPermisosClick,
}) => [
  {
    ...accionesReutilizables.gestionarAcciones,
    label: "Vincular Permisos",
    onClick: (fila) => handleVincularPermisosClick(fila),
  },
  {
    ...accionesReutilizables.usuarios,
    label: "Gestionar Usuarios",
    onClick: (fila) => handleGestionarUsuariosClick(fila),
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
