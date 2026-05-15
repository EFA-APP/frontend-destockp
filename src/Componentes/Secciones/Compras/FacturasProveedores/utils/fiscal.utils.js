/**
 * Fiscal and Calculation Utilities for the Invoicing (Comprobantes) module.
 * These functions are pure, meaning they don't depend on external state,
 * which makes them easy to test and reliable for fiscal reports.
 */

/**
 * Safely extracts price from a product object, handling dynamic attributes and string formats.
 * @param {Object} prod - The product object.
 * @param {string} col - The attribute key (e.g., 'precioVenta').
 * @returns {number} The parsed price.
 */
export const getPrecio = (prod, col) => {
  if (!prod || !col) return 0;

  let attr = prod.atributos?.[col];

  if (typeof prod.atributos === "string") {
    try {
      const parsed = JSON.parse(prod.atributos);
      attr = parsed[col];
    } catch (e) {}
  }

  if (attr === undefined && prod[col] !== undefined) {
    attr = prod[col];
  }

  if (attr !== undefined && attr !== null && attr !== "") {
    if (typeof attr === "number") return attr;
    if (typeof attr === "string") {
      const clean = attr.replace(/\./g, "").replace(",", ".");
      const val = parseFloat(clean);
      if (!isNaN(val)) return val;
    }
  }

  return 0;
};

/**
 * Calculates the final subtotal for a single item (Quantity * Price) minus discount percentage.
 * @param {Object} item - Item object with cantidad, precioUnitario, and descuento.
 * @returns {number} Total amount for this line.
 */
export const calcularTotalItem = (item) => {
  const bruto = (item.cantidad || 0) * (item.precioUnitario || 0);
  const desc = bruto * ((item.descuento || 0) / 100);
  return bruto - desc;
};

/**
 * Calculates the VAT (IVA) amount for a single item based on its total.
 * Only applies if 'aplicaIva' is true for the session.
 * @param {Object} item - Item with tasaIva.
 * @param {boolean} aplicaIva - Fiscal context.
 * @returns {number} The VAT amount.
 */
export const calcularIVA = (item, aplicaIva) => {
  if (!aplicaIva) return 0;
  const totalConDescuento = calcularTotalItem(item);
  const tasa = parseFloat(item.tasaIva) || 0;
  // Formula: Total - (Total / (1 + Tasa%))
  const neto = totalConDescuento / (1 + tasa / 100);
  return totalConDescuento - neto;
};

/**
 * Calculates the Net price (subtotal without VAT) for a single item.
 * @param {Object} item - Item object.
 * @param {boolean} aplicaIva - Fiscal context.
 * @returns {number} The Net amount.
 */
export const calcularNetoItem = (item, aplicaIva) => {
  const total = calcularTotalItem(item);
  if (!aplicaIva) return total;
  const tasa = parseFloat(item.tasaIva) || 0;
  return total / (1 + tasa / 100);
};
