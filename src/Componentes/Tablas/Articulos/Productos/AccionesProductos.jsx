import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";
import { Copy } from "lucide-react";

export const accionesProductos = ({
  handleEditarClick,
  handleEliminarClick,
  handleDuplicarClick,
}) => [
    {
      ...accionesReutilizables.editar,
      onClick: (fila) => handleEditarClick(fila),
    },
    {
      ...accionesReutilizables.duplicar,
      onClick: (fila) => handleDuplicarClick(fila),
    },
    {
      ...accionesReutilizables.eliminar,
      onClick: (fila) => handleEliminarClick(fila.codigoSecuencial, fila.nombre),
    },
  ];
