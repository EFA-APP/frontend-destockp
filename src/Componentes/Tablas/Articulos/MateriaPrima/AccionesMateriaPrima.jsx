import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesMateriaPrimas = ({
  handleEliminarClick,
  handleEditarClick,
}) => [
    {
      ...accionesReutilizables.editar,
      onClick: (fila) => {
        handleEditarClick(fila)
      },
    },
    {
      ...accionesReutilizables.eliminar,
      onClick: (fila) => {
        handleEliminarClick(fila.codigoSecuencial, fila.nombre)
      },
    },
  ];
