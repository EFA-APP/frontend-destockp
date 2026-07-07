/**
 * Regla condición de comprobante → método(s) de pago habilitado(s).
 *
 * Única fuente de verdad usada por DetallePago.jsx, Ingresos.jsx y Egresos.jsx
 * para no duplicar la regla de negocio en 3 lugares.
 */

export const METODOS_POR_CONDICION = {
  CONTADO: [
    "EFECTIVO",
    "TRANSFERENCIA",
    "TARJETA_DEBITO",
    "TARJETA_CREDITO",
    "CHEQUE_PROPIO",
    "CHEQUE_TERCERO",
  ],
  CUENTA_CORRIENTE: [
    "EFECTIVO",
    "TRANSFERENCIA",
    "TARJETA_DEBITO",
    "TARJETA_CREDITO",
    "CHEQUE_PROPIO",
    "CHEQUE_TERCERO",
  ],
  CREDITO_30_DIAS: [],
  CREDITO_60_DIAS: [],
  CREDITO_90_DIAS: [],
};

/**
 * Devuelve true si la condición admite agregar más de un método de pago.
 */
export const permiteMultiplesPagos = (condicionComprobante) => {
  return condicionComprobante === 'CONTADO' || condicionComprobante === 'CUENTA_CORRIENTE';
};

/**
 * Devuelve los métodos de pago permitidos para una condición de comprobante.
 *
 * - `null` = sin restricción (condicionComprobante falsy: Recibos.jsx y
 *   OrdenPago.jsx no pasan esta prop a DetallePago, preservando los 6
 *   métodos disponibles ya existentes).
 * - `[]` = la condición no requiere método de pago (CUENTA_CORRIENTE,
 *   CREDITO_30/60/90_DIAS).
 * - `string[]` no vacío = restringe el selector a esos valores.
 */
export const obtenerMetodosPermitidos = (condicionComprobante) => {
  if (!condicionComprobante) return null;
  return METODOS_POR_CONDICION[condicionComprobante] ?? null;
};

/**
 * Devuelve `true` si la condición de comprobante exige al menos un método de
 * pago cargado antes de guardar (usado en Ingresos.jsx / Egresos.jsx).
 */
export const requierePago = (condicionComprobante) => {
  return condicionComprobante === 'CONTADO';
};
