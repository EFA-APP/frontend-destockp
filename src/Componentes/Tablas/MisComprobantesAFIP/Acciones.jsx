import { accionesReutilizables } from "../../UI/AccionesReutilizables";

  export const accionesMisComprobantesAFIP =  ({handleVerDetalle,handleGenerarComprobante  }) => [
    {
      ...accionesReutilizables.verDetalle,
      onClick: handleVerDetalle,
    },
    {
      ...accionesReutilizables.generarComprobante,
      onClick: handleGenerarComprobante,
      visible: (fila) => fila.estado === "PENDIENTE",
    },
  ];