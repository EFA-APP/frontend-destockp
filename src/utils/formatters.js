/**
 * Utilidades de formateo para la aplicación.
 * Estas funciones centralizan el estilo de presentación de precios y números.
 */

/**
 * Formatea un valor numérico a moneda (ARS por defecto) con dos decimales.
 * @param {number|string} val - El valor a formatear.
 * @returns {string} - El valor formateado (ej: $ 1.234,56).
 */
export const formatPrice = (val) => {
  if (val === null || val === undefined || val === "") return "$ 0,00";
  
  const parsed = typeof val === "string" 
    ? parseFloat(val.replace(',', '.')) 
    : val;

  if (isNaN(parsed)) return "$ 0,00";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed);
};

/**
 * Formatea un valor numérico con dos decimales sin el símbolo de moneda.
 * @param {number|string} val - El valor a formatear.
 * @returns {string} - El valor formateado (ej: 1.234,56).
 */
export const formatNumber = (val) => {
  if (val === null || val === undefined || val === "") return "0,00";
  
  const parsed = typeof val === "string" 
    ? parseFloat(val.replace(',', '.')) 
    : val;

  if (isNaN(parsed)) return val;

  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed);
};

/**
 * Convierte un string de moneda/número a un valor numérico limpio.
 * Ideal para procesar entradas de Excel o inputs de usuario.
 * @param {any} val - El valor a limpiar.
 * @returns {number} - El valor numérico con 2 decimales.
 */
export const parseCurrency = (val) => {
  if (typeof val === "number") return parseFloat(val.toFixed(2));
  if (!val) return 0;
  
  const n = parseFloat(
    String(val)
      .replace(/[$\s]/g, "") // Quita símbolo $ y espacios
      .replace(/\./g, "")    // Quita puntos de miles
      .replace(",", ".")     // Cambia coma decimal por punto
  );
  
  return isNaN(n) ? 0 : parseFloat(n.toFixed(2));
};

/**
 * Formatea una fecha ISO o string a formato legible (DD/MM/YYYY).
 * @param {string|Date} date - La fecha a formatear.
 * @returns {string} - La fecha formateada.
 */
export const formatDate = (date) => {
  if (!date) return "-";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return new Intl.DateTimeFormat("es-AR").format(d);
  } catch (e) {
    return date;
  }
};
