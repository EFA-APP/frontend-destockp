import { DetalleIcono, ProduccionIcono, HistorialIcono, EditarIcono } from "../../../../assets/Icons";
import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesProductos = ({
  handleEliminarClick,
  handleGestionar,
  handleProduccion,
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
      label: "Registrar Lote de Producción",
      icon: <ProduccionIcono size={16} />,
      color: "text-purple-500",
      onClick: handleProduccion,
    },
    {
      ...accionesReutilizables.eliminar,
      onClick: (fila) => handleEliminarClick(fila.codigoSecuencial, fila.nombre),
    },
  ];
