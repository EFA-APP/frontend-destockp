import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesComprobantes = ({
  handleVerDetalle,
  handleVerAdjuntos,
  tieneAccion = () => true, // Por defecto permitir si no hay permisos complejos
}) => [
    {
      ...accionesReutilizables.verDetalle,
      onClick: (fila) => handleVerDetalle(fila),
    },
    {
      ...accionesReutilizables.verAdjuntos,
      onClick: (fila) => handleVerAdjuntos(fila),
    },
  ];
