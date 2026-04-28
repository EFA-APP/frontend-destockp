import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesComprobantes = ({
  handleVerDetalle,
  handleVerAdjuntos,
  handleEmitirPago,
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
    {
      ...accionesReutilizables.generarComprobante,
      mostrar: (fila) => {
        const saldoPendiente = fila.saldoPendiente !== undefined 
          ? fila.saldoPendiente 
          : (fila.total - (fila.pagos?.reduce((a, p) => a + (p.monto || 0), 0) || 0));
        return fila.condicionVenta === "cuenta_corriente" && saldoPendiente > 0.01;
      },
      onClick: (fila) => handleEmitirPago(fila),
    }
  ];
