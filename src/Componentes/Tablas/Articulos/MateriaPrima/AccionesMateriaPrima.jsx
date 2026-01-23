import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesMateriaPrimas = ({
  manejarEliminar,
  handleVerDetalle,
  handleEditar,
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
    ...accionesReutilizables.eliminar,
    onClick: (fila) => manejarEliminar(fila.id),
  },
];
