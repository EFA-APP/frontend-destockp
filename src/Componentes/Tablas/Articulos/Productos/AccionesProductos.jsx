import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesProductos = ({
  handleEditarClick,
  handleEliminarClick,
  handleDuplicarClick,
  handleAgregarImagen,
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
  ...(tieneAccion("CARGAR_IMAGEN_PRODUCTO")
    ? [
        {
          ...accionesReutilizables.agregarImagen,
          onClick: (fila) => handleAgregarImagen(fila),
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
            handleEliminarClick(fila.codigo, fila.nombre),
        },
      ]
    : []),
];
