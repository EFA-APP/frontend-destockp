import { DetalleIcono, ProduccionIcono } from "../../../../assets/Icons";
import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesProductos = ({
  handleEliminarClick,
  handleGestionar,
  handleProduccion,
}) => [
    {
      ...accionesReutilizables.gestionar,
      onClick: handleGestionar,
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
