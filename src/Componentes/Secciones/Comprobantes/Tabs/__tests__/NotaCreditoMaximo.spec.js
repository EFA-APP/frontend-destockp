/**
 * Feature 7 (comprobante-pago-desacoplado), T16. Cubre: R23.
 *
 * Tests de lógica pura — sin @testing-library/react (mismo patrón que
 * Egresos.spec.js/CrearComprobante.spec.js). Replica el cálculo de
 * `maximo` del bloque de validación de Nota de Crédito de
 * Ingresos.jsx/Egresos.jsx (idéntico en ambos archivos).
 */

// ─── Lógica extraída de Ingresos.jsx/Egresos.jsx (handleGuardar) ──────────

function calcularMaximo(comprobanteAsociado) {
  return comprobanteAsociado.estado === "ABONADO"
    ? comprobanteAsociado.total
    : (comprobanteAsociado.saldoPendiente ?? comprobanteAsociado.total);
}

describe("Nota de Crédito — cálculo de máximo permitido (T16, R23)", () => {
  it("factura ABONADO (saldoPendiente 0, pagada por Recibo): el máximo es el total, no 0", () => {
    const comprobanteAsociado = {
      estado: "ABONADO",
      total: 1000,
      saldoPendiente: 0,
    };
    expect(calcularMaximo(comprobanteAsociado)).toBe(1000);
  });

  it("factura PENDIENTE_PAGO: el máximo sigue siendo el saldoPendiente (sin cambios)", () => {
    const comprobanteAsociado = {
      estado: "PENDIENTE_PAGO",
      total: 1000,
      saldoPendiente: 400,
    };
    expect(calcularMaximo(comprobanteAsociado)).toBe(400);
  });

  it("factura PENDIENTE_PAGO sin saldoPendiente definido: fallback al total (sin cambios)", () => {
    const comprobanteAsociado = {
      estado: "PENDIENTE_PAGO",
      total: 1000,
      saldoPendiente: undefined,
    };
    expect(calcularMaximo(comprobanteAsociado)).toBe(1000);
  });

  it("factura ANULADO (caso de borde, no debería llegar acá): usa saldoPendiente ?? total, no el branch de ABONADO", () => {
    const comprobanteAsociado = {
      estado: "ANULADO",
      total: 1000,
      saldoPendiente: 0,
    };
    expect(calcularMaximo(comprobanteAsociado)).toBe(0);
  });
});
