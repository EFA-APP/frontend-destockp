import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesProductos = ({
  handleEditarClick,
  handleEliminarClick,
  handleDuplicarClick,
  tieneAccion,
}) => [
  ...(tieneAccion("EDITAR_PRODUCTO")
    ? [
        {
          ...accionesReutilizables.editar,
          onClick: (fila) => handleEditarClick(fila),
        },
      ]
    : []),
  ...(tieneAccion("DUPLICAR_PRODUCTO")
    ? [
        {
          ...accionesReutilizables.duplicar,
          onClick: (fila) => handleDuplicarClick(fila),
        },
      ]
    : []),
  ...(tieneAccion("ELIMINAR_PRODUCTO")
    ? [
        {
          ...accionesReutilizables.eliminar,
          onClick: (fila) =>
            handleEliminarClick(fila.codigoSecuencial, fila.nombre),
        },
      ]
    : []),
];
