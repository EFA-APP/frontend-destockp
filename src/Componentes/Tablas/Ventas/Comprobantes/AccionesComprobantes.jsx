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
  // de aca para abajo necesito que se muestre cuando el estado sea diferente a "ANULADO"
  {
    ...accionesReutilizables.generarComprobante,
    mostrar: (fila) => {
      const saldoPendiente =
        fila.saldoPendiente !== undefined
          ? fila.saldoPendiente
          : fila.total -
            (fila.pagos?.reduce((a, p) => a + (p.monto || 0), 0) || 0);
      return (
        fila.condicionVenta === "cuenta_corriente" &&
        saldoPendiente > 0.01 &&
        fila.estado !== "ANULADO"
      );
    },
    onClick: (fila) => handleEmitirPago(fila, "PAGO"),
  },
  {
    ...accionesReutilizables.notaCredito,
    mostrar: (fila) => {
      const tipo = Number(fila.tipoDocumento);
      return (
        [1, 6, 11, 51, 99, 991].includes(tipo) && fila.estado !== "ANULADO"
      );
    },
    onClick: (fila) => handleEmitirPago(fila, "NC"),
  },
  {
    ...accionesReutilizables.notaDebito,
    mostrar: (fila) => {
      const tipo = Number(fila.tipoDocumento);
      return (
        [1, 6, 11, 51, 99, 991].includes(tipo) && fila.estado !== "ANULADO"
      );
    },
    onClick: (fila) => handleEmitirPago(fila, "ND"),
  },
];
