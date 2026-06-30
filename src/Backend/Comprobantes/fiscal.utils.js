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

  // Try to retrieve from atributos object (could be a JSON string).
  let attr;
  if (prod.atributos && typeof prod.atributos === "object") {
    attr = prod.atributos[col];
  } else if (typeof prod.atributos === "string") {
    try {
      const parsed = JSON.parse(prod.atributos);
      attr = parsed[col];
    } catch (e) {
      // ignore JSON parse errors
    }
  }

  // Direct property fallback.
  if (attr === undefined && prod[col] !== undefined) {
    attr = prod[col];
  }

  // Common alternative price field names.
  if (attr === undefined) {
    const alternatives = ["precio", "price", "precioVenta", "precioUnitario", "valor"];
    for (const alt of alternatives) {
      if (prod[alt] !== undefined) {
        attr = prod[alt];
        break;
      }
      if (prod.atributos && typeof prod.atributos === "object" && prod.atributos[alt] !== undefined) {
        attr = prod.atributos[alt];
        break;
      }
    }
  }

  // Normalize to number.
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
 * @param {boolean} aplicaIva - Fiscal context.
 * @param {string} letraComprobante - Voucher letter (e.g., 'A', 'B', 'C', 'X').
 * @returns {number} Total amount for this line.
 */
export const calcularTotalItem = (item, aplicaIva = false, letraComprobante = "X") => {
  const bruto = (item.cantidad || 0) * (item.precioUnitario || 0);
  const desc = bruto * ((item.descuento || 0) / 100);
  const base = bruto - desc;
  if (letraComprobante === "A" && aplicaIva) {
    const tasa = parseFloat(item.tasaIva) || 0;
    return base * (1 + tasa / 100);
  }
  return base;
};

/**
 * Calculates the VAT (IVA) amount for a single item based on its total.
 * Only applies if 'aplicaIva' is true for the session.
 * @param {Object} item - Item with tasaIva.
 * @param {boolean} aplicaIva - Fiscal context.
 * @param {string} letraComprobante - Voucher letter.
 * @returns {number} The VAT amount.
 */
export const calcularIVA = (item, aplicaIva = false, letraComprobante = "X") => {
  const bruto = (item.cantidad || 0) * (item.precioUnitario || 0);
  const desc = bruto * ((item.descuento || 0) / 100);
  const base = bruto - desc;
  
  if (letraComprobante === "A" && aplicaIva) {
    const tasa = parseFloat(item.tasaIva) || 0;
    return base * (tasa / 100);
  }
  if (!aplicaIva) return 0;
  const tasa = parseFloat(item.tasaIva) || 0;
  const neto = base / (1 + tasa / 100);
  return base - neto;
};

/**
 * Calculates the Net price (subtotal without VAT) for a single item.
 * @param {Object} item - Item object.
 * @param {boolean} aplicaIva - Fiscal context.
 * @param {string} letraComprobante - Voucher letter.
 * @returns {number} The Net amount.
 */
export const calcularNetoItem = (item, aplicaIva = false, letraComprobante = "X") => {
  const bruto = (item.cantidad || 0) * (item.precioUnitario || 0);
  const desc = bruto * ((item.descuento || 0) / 100);
  const base = bruto - desc;
  
  if (letraComprobante === "A") {
    return base;
  }
  if (!aplicaIva) return base;
  const tasa = parseFloat(item.tasaIva) || 0;
  return base / (1 + tasa / 100);
};
