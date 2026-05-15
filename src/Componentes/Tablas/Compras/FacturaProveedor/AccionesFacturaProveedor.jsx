import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesFacturaProveedor = ({
  handleVerDetalle,
  handleVerAdjuntos,
  handleEmitirPago,
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
    label: "Abonar Factura",
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
    mostrar: (fila) => fila.estado !== "ANULADO",
    onClick: (fila) => handleEmitirPago(fila, "NC"),
  },
  {
    ...accionesReutilizables.notaDebito,
    mostrar: (fila) => fila.estado !== "ANULADO",
    onClick: (fila) => handleEmitirPago(fila, "ND"),
  },
];
