import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesMateriaPrimas = ({
  handleEliminarClick,
  handleVerDetalle,
  handleEditar,
  handleMovimiento,
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
    ...accionesReutilizables.verHistorial,
    onClick: handleVerHistorial,
  },
  {
    ...accionesReutilizables.generarMovimientoProducto,
    onClick: handleMovimiento,
  },
  {
    ...accionesReutilizables.eliminar,
    onClick: (fila) => {
      handleEliminarClick(fila.codigoSecuencial, fila.nombre)
    },
  },
];
