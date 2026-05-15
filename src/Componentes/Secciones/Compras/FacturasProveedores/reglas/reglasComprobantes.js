import { CONDICION_IVA, TIPO_COMPROBANTE } from "./reglasFiscales";

/**
 * Determina qué comprobantes están permitidos según la relación Emisor -> Receptor
 * @param {number} condicionEmisor - ID de condición IVA del emisor (RI, RM, etc)
 * @param {number} condicionReceptor - ID de condición IVA del receptor
 * @returns {number[]} Array de IDs de tipos de comprobante permitidos
 */
export const obtenerComprobantesPermitidos = (
  condicionEmisor,
  condicionReceptor,
) => {
  const emisor = Number(condicionEmisor);
  const receptor = Number(condicionReceptor);

  // --- REGLAS PARA RESPONSABLE INSCRIPTO ---
  if (emisor === CONDICION_IVA.RI) {
    // RI a RI -> Factura A
    if (receptor === CONDICION_IVA.RI) {
      return [
        TIPO_COMPROBANTE.FACTURA_A,
        TIPO_COMPROBANTE.NC_A,
        TIPO_COMPROBANTE.ND_A,
        TIPO_COMPROBANTE.RECIBO_A,
      ];
    }
    // RI a Cualquier otro -> Factura B
    return [
      TIPO_COMPROBANTE.FACTURA_B,
      TIPO_COMPROBANTE.NC_B,
      TIPO_COMPROBANTE.ND_B,
      TIPO_COMPROBANTE.RECIBO_B,
    ];
  }

  // --- REGLAS PARA MONOTRIBUTISTA O EXENTO ---
  if (emisor === CONDICION_IVA.RM || emisor === CONDICION_IVA.EX) {
    // Siempre Factura C independientemente del receptor
    return [
      TIPO_COMPROBANTE.FACTURA_C,
      TIPO_COMPROBANTE.NC_C,
      TIPO_COMPROBANTE.ND_C,
      TIPO_COMPROBANTE.RECIBO_C,
    ];
  }

  // Fallback (Interno)
  return [TIPO_COMPROBANTE.INTERNO];
};

/**
 * Mapea un comprobante original a su correspondiente ajuste (NC/ND)
 */
export const obtenerAjusteCorrespondiente = (
  tipoOriginal,
  tipoAjuste = "NC",
) => {
  const tipo = Number(tipoOriginal);

  const mapa = {
    // Original -> [NC, ND, RECIBO]
    [TIPO_COMPROBANTE.FACTURA_A]: [
      TIPO_COMPROBANTE.NC_A,
      TIPO_COMPROBANTE.ND_A,
      TIPO_COMPROBANTE.RECIBO_A,
    ],
    [TIPO_COMPROBANTE.FACTURA_B]: [
      TIPO_COMPROBANTE.NC_B,
      TIPO_COMPROBANTE.ND_B,
      TIPO_COMPROBANTE.RECIBO_B,
    ],
    [TIPO_COMPROBANTE.FACTURA_C]: [
      TIPO_COMPROBANTE.NC_C,
      TIPO_COMPROBANTE.ND_C,
      TIPO_COMPROBANTE.RECIBO_C,
    ],
    [TIPO_COMPROBANTE.FACTURA_M]: [
      TIPO_COMPROBANTE.NC_M,
      TIPO_COMPROBANTE.ND_M,
      TIPO_COMPROBANTE.RECIBO_C,
    ],
  };

  const idx = tipoAjuste === "NC" ? 0 : tipoAjuste === "ND" ? 1 : 2;
  return mapa[tipo]?.[idx] || TIPO_COMPROBANTE.INTERNO;
};
