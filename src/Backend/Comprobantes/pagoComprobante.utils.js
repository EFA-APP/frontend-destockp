/**
 * Precarga del detalle de pago del comprobante asociado, al crear una Nota de
 * Crédito/Débito en Ingresos.jsx/Egresos.jsx (mismo criterio ya usado para
 * precargar ítems, cliente, condición, punto de venta y unidad de negocio en
 * el useEffect "Cuando se selecciona un comprobante para asociar").
 *
 * Convierte un pago tal como lo devuelve GET /comprobantes/obtener/:codigo
 * (con datosTarjeta/chequeTercero/chequePropio incluidos, shape crudo de
 * Prisma) al shape local que espera el estado `pagos` de Ingresos.jsx/
 * Egresos.jsx — el mismo shape que arma DetallePago.jsx::handleAgregarPago,
 * para que se renderice igual que un pago cargado a mano.
 *
 * Decisión de negocio confirmada por el usuario: el monto se copia tal cual
 * del pago original (NO se recalcula proporcional al importe a aplicar de una
 * NC parcial); si el usuario necesita ajustarlo, lo edita manualmente antes
 * de guardar.
 *
 * Riesgo conocido y documentado (no resuelto acá, es una decisión de UX
 * pendiente del usuario): si el pago original fue CHEQUE_TERCERO o
 * CHEQUE_PROPIO, el payload de creación de comprobante envía los datos del
 * cheque sin código de referencia, por lo que comprobantes-ms
 * (DetallePago.repositorio.ts::crearPagoChequeTercero/crearPagoChequePropio)
 * crea un registro NUEVO de ChequeTercero/ChequePropio en vez de referenciar
 * el original — duplicando el cheque físico como si fuera uno nuevo. Se
 * precarga igual porque el usuario lo pidió explícitamente y el registro
 * queda editable/eliminable en el formulario antes de guardar.
 */

const soloFecha = (valor) => (valor ? String(valor).slice(0, 10) : "");

export const mapearPagoPrecargaAsociado = (
  pago,
  mapaCuentasPorCodigo = new Map(),
) => ({
  id: `asociado-${pago.codigo}`,
  tipoMetodoPago: pago.tipoMetodoPago,
  monto: pago.monto,
  referencia: pago.referencia || "",
  codigoBancoDestino: pago.codigoBancoDestino || 0,
  nombreBanco: mapaCuentasPorCodigo.get(pago.codigoBancoDestino)?.nombre || "",
  ...(pago.datosTarjeta && {
    datosTarjeta: {
      marca: pago.datosTarjeta.marca || "",
      cantidadCuotas: pago.datosTarjeta.cantidadCuotas || 1,
      recargo: pago.datosTarjeta.recargo || 0,
      cupon: pago.datosTarjeta.cupon || "",
      lote: pago.datosTarjeta.lote || "",
      autorizacion: pago.datosTarjeta.autorizacion || "",
      fechaAcreditacion: soloFecha(pago.datosTarjeta.fechaAcreditacion),
    },
  }),
  ...(pago.chequeTercero && {
    chequeTercero: {
      banco: pago.chequeTercero.banco || "",
      numero: pago.chequeTercero.numero || "",
      cuitEmisor: pago.chequeTercero.cuitEmisor || "",
      titular: pago.chequeTercero.titular || "",
      fechaEmision: soloFecha(pago.chequeTercero.fechaEmision),
      fechaPago: soloFecha(pago.chequeTercero.fechaPago),
    },
  }),
  ...(pago.chequePropio && {
    chequePropio: {
      tipoCheque: pago.chequePropio.tipoCheque,
      banco: pago.chequePropio.banco || "",
      sucursal: pago.chequePropio.sucursal || "",
      numero: pago.chequePropio.numero || "",
      cuenta: pago.chequePropio.cuenta || "",
      fechaEmision: soloFecha(pago.chequePropio.fechaEmision),
      fechaPago: soloFecha(pago.chequePropio.fechaPago),
      importe: pago.chequePropio.importe,
    },
  }),
});

export const mapearPagosPrecargaAsociado = (
  pagos = [],
  mapaCuentasPorCodigo = new Map(),
) => pagos.map((p) => mapearPagoPrecargaAsociado(p, mapaCuentasPorCodigo));

export const obtenerCodigosBancoUnicos = (pagos = []) => [
  ...new Set(
    pagos.map((p) => p.codigoBancoDestino).filter((c) => c && c > 0),
  ),
];

export const construirMapaCuentasPorCodigo = (cuentas = []) =>
  new Map(cuentas.map((c) => [c.codigoSecuencial, c]));
