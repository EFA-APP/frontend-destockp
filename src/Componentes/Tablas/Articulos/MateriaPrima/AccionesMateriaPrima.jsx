import { EditarIcono, HistorialIcono } from "../../../../assets/Icons";
import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesMateriaPrimas = ({
  handleEliminarClick,
  handleGestionar,
  handleHistorial,
}) => [
    {
      label: "Editar Artículo",
      icon: <EditarIcono size={16} />,
      color: "text-blue-500",
      onClick: handleGestionar,
    },
    {
      label: "Ver Historial",
      icon: <HistorialIcono size={16} />,
      color: "text-amber-500",
      onClick: handleHistorial,
    },
    {
      ...accionesReutilizables.eliminar,
      onClick: (fila) => {
        handleEliminarClick(fila.codigoSecuencial, fila.nombre)
      },
    },
  ];
