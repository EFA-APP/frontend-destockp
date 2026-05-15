import { accionesReutilizables } from "../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesUnidadesNegocio = ({
  handleEditarClick,
  handleEliminarClick,
}) => [
  {
    ...accionesReutilizables.editar,
    onClick: (fila) => handleEditarClick(fila),
  },
  {
    ...accionesReutilizables.eliminar,
    onClick: (fila) => handleEliminarClick(fila),
  },
];
