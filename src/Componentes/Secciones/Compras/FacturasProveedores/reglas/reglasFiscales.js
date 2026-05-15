/**
 * Definiciones base de la normativa fiscal argentina (AFIP/ARCA)
 */

export const CONDICION_IVA = {
  RI: 1, // Responsable Inscripto
  EX: 4, // Exento
  CF: 5, // Consumidor Final
  RM: 6, // Responsable Monotributo
};

export const TIPO_COMPROBANTE = {
  FACTURA_A: 1,
  ND_A: 2,
  NC_A: 3,
  RECIBO_A: 4,
  FACTURA_B: 6,
  ND_B: 7,
  NC_B: 8,
  RECIBO_B: 9,
  FACTURA_C: 11,
  ND_C: 12,
  NC_C: 13,
  RECIBO_C: 15,
  FACTURA_M: 51,
  ND_M: 52,
  NC_M: 53,
  INTERNO: 99,
  INTERNO_VENTA: 991,
  INTERNO_RECIBO: 992,
  INTERNO_NC: 993,
  INTERNO_ND: 994,
};

export const LETRA_COMPROBANTE = {
  A: "A",
  B: "B",
  C: "C",
  M: "M",
  X: "X",
};

/**
 * Determina la letra del comprobante según su ID numérico de AFIP
 */
export const obtenerLetraPorTipo = (tipoId) => {
  const tipo = Number(tipoId);
  if ([1, 2, 3, 4, 5].includes(tipo)) return LETRA_COMPROBANTE.A;
  if ([6, 7, 8, 9, 10].includes(tipo)) return LETRA_COMPROBANTE.B;
  if ([11, 12, 13, 15].includes(tipo)) return LETRA_COMPROBANTE.C;
  if ([51, 52, 53, 54].includes(tipo)) return LETRA_COMPROBANTE.M;
  return LETRA_COMPROBANTE.X;
};

/**
 * Identifica si un comprobante es una nota de crédito
 */
export const esNotaCredito = (tipoId) => {
  return [3, 8, 13, 53, 203, 208, 213, 993].includes(Number(tipoId));
};

/**
 * Identifica si un comprobante es una nota de débito
 */
export const esNotaDebito = (tipoId) => {
  return [2, 7, 12, 52, 202, 207, 212, 994].includes(Number(tipoId));
};

/**
 * Identifica si un comprobante es un recibo
 */
export const esRecibo = (tipoId) => {
  return [4, 9, 15, 54, 99, 992].includes(Number(tipoId));
};
