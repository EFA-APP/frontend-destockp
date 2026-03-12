import { DetalleIcono } from "../../../../assets/Icons";
import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesProductos = ({
  handleEliminarClick,
  handleGestionar,
}) => [
    {
      ...accionesReutilizables.gestionar,
      onClick: handleGestionar,
    },
    {
      ...accionesReutilizables.eliminar,
      onClick: (fila) => handleEliminarClick(fila.codigoSecuencial, fila.nombre),
    },
  ];
