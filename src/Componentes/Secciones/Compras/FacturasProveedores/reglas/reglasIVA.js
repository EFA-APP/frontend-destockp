import { CONDICION_IVA, obtenerLetraPorTipo } from "./reglasFiscales";

/**
 * Determina si se debe discriminar el IVA en el comprobante
 * @param {number} condicionEmisor 
 * @param {number} condicionReceptor 
 * @param {number} tipoComprobante 
 * @returns {boolean}
 */
export const debeDiscriminarIVA = (condicionEmisor, condicionReceptor, tipoComprobante) => {
  const emisor = Number(condicionEmisor);
  const receptor = Number(condicionReceptor);
  const letra = obtenerLetraPorTipo(tipoComprobante);

  // Solo se discrimina si el emisor es RI y el comprobante es letra A o M
  return emisor === CONDICION_IVA.RI && (letra === "A" || letra === "M");
};

/**
 * Determina si los precios se deben mostrar con IVA incluido o neto
 * (Para la UI del carrito)
 */
export const mostrarPreciosConIVA = (condicionEmisor, tipoComprobante) => {
  const emisor = Number(condicionEmisor);
  const letra = obtenerLetraPorTipo(tipoComprobante);

  // Si el emisor es Monotributista o el comprobante es B/C, el precio es "final"
  if (emisor === CONDICION_IVA.RM) return true;
  if (letra === "B" || letra === "C") return true;

  return false;
};

/**
 * Tasas de IVA permitidas por defecto
 */
export const TASAS_IVA = [
  { id: 1, tasa: 0, label: "0%" },
  { id: 2, tasa: 10.5, label: "10.5%" },
  { id: 3, tasa: 21, label: "21%" },
  { id: 4, tasa: 27, label: "27%" },
];
