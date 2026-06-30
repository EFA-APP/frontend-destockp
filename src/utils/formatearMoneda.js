/**
 * Formateo de montos en pesos argentinos para la gestión de cuotas.
 *
 * R10, R32
 */

/**
 * Formatea un número como monto ARS con separadores de miles y sin decimales.
 * Ejemplo: 130000 → "$ 130.000"
 *
 * @param {number|string} valor
 * @returns {string}
 */
export function formatearARS(valor) {
  if (valor === null || valor === undefined || valor === "") return "$ 0";
  const numero = typeof valor === "string" ? parseFloat(valor) : valor;
  if (isNaN(numero)) return "$ 0";
  return "$ " + new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numero);
}
