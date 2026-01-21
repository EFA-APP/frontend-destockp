import { accionesReutilizables } from "../../../UI/AccionesReutilizables";

  export const accionesProveedor =  ({ manejarEliminar, handleVerDetalle, handleEditar }) => [
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