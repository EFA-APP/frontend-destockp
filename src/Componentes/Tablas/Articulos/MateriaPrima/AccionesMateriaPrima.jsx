import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesMateriaPrimas = ({
  handleEliminarClick,
  handleGestionar,
}) => [
    {
      ...accionesReutilizables.gestionar,
      onClick: handleGestionar,
    },
    {
      ...accionesReutilizables.eliminar,
      onClick: (fila) => {
        handleEliminarClick(fila.codigoSecuencial, fila.nombre)
      },
    },
  ];
