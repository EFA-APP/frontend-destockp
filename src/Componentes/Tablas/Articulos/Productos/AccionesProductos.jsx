import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesProductos = ({
  handleEliminarClick,
  handleVerDetalle,
  handleEditar,
  handleMovimiento,
  handleProduccion,
  handleVerHistorial,
}) => [
  {
    ...accionesReutilizables.verDetalle,
    onClick: handleVerDetalle,
  },
  {
    ...accionesReutilizables.editar,
    onClick: handleEditar,
  },
  {
    ...accionesReutilizables.registrarProduccion,
    onClick: handleProduccion,
  },
  {
    ...accionesReutilizables.verHistorial,
    onClick: handleVerHistorial,
  },
  {
    ...accionesReutilizables.generarMovimientoProducto,
    onClick: handleMovimiento,
  },
  {
    ...accionesReutilizables.eliminar,
    onClick: (fila) => handleEliminarClick(fila.codigoSecuencial, fila.nombre),
  },
];
