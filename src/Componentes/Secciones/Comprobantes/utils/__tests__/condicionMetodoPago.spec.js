/**
 * Feature 7 (comprobante-pago-desacoplado), T10. Cubre: R5.
 *
 * CUENTA_CORRIENTE deja de admitir pago inline, mismo criterio que
 * CREDITO_30/60/90_DIAS.
 */
import {
  METODOS_POR_CONDICION,
  permiteMultiplesPagos,
  obtenerMetodosPermitidos,
  requierePago,
} from "../condicionMetodoPago.js";

describe("condicionMetodoPago — CUENTA_CORRIENTE sin pago inline (R5)", () => {
  it("METODOS_POR_CONDICION.CUENTA_CORRIENTE es un arreglo vacío", () => {
    expect(METODOS_POR_CONDICION.CUENTA_CORRIENTE).toEqual([]);
  });

  it("obtenerMetodosPermitidos('CUENTA_CORRIENTE') devuelve []", () => {
    expect(obtenerMetodosPermitidos("CUENTA_CORRIENTE")).toEqual([]);
  });

  it("permiteMultiplesPagos ya no incluye CUENTA_CORRIENTE", () => {
    expect(permiteMultiplesPagos("CUENTA_CORRIENTE")).toBe(false);
    expect(permiteMultiplesPagos("CONTADO")).toBe(true);
  });

  it("requierePago sigue devolviendo true solo para CONTADO (sin cambios de firma)", () => {
    expect(requierePago("CONTADO")).toBe(true);
    expect(requierePago("CUENTA_CORRIENTE")).toBe(false);
    expect(requierePago("CREDITO_30_DIAS")).toBe(false);
  });

  it("CONTADO conserva los 6 métodos existentes (sin regresión)", () => {
    expect(METODOS_POR_CONDICION.CONTADO).toEqual([
      "EFECTIVO",
      "TRANSFERENCIA",
      "TARJETA_DEBITO",
      "TARJETA_CREDITO",
      "CHEQUE_PROPIO",
      "CHEQUE_TERCERO",
    ]);
  });

  it("obtenerMetodosPermitidos(null) sigue devolviendo null (sin restricción, Recibos/OrdenPago)", () => {
    expect(obtenerMetodosPermitidos(null)).toBeNull();
  });
});
