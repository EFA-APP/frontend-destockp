import { obtenerLetraPorTipo, CONDICION_IVA } from "./reglasFiscales";

/**
 * Realiza validaciones fiscales sobre el objeto de comprobante completo
 * @param {object} data - DTO del comprobante
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarOperacionFiscal = (data) => {
  const { letraComprobante, receptor, fiscal } = data;
  
  if (!fiscal) return null; // No validar si es interno

  const condicionReceptor = Number(receptor?.CondicionIVAReceptorId);
  const letra = letraComprobante?.toUpperCase();

  // 1. Factura A solo para RI
  if (letra === "A" && condicionReceptor !== CONDICION_IVA.RI) {
    return "No se puede emitir un comprobante Letra A a un receptor que no sea Responsable Inscripto.";
  }

  // 2. Factura B no suele enviarse a RI (aunque AFIP lo permite en ciertos casos, el sistema suele preferir A)
  // Pero lo más importante es que si es Consumidor Final (5), no puede recibir Factura A.

  // 3. Validar montos para Consumidor Final (AFIP exige identificar si supera cierto monto)
  const total = Number(data.totales?.total || 0);
  if (condicionReceptor === CONDICION_IVA.CF && total > 100000 && (!receptor?.DocNro || receptor.DocNro === "0")) {
     return "Para ventas mayores a $100.000 a Consumidor Final, es obligatorio identificar al cliente (DNI/CUIT).";
  }

  return null;
};
