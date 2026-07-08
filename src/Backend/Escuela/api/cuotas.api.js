import { axiosInitial as axios } from "../../Config";

/**
 * Emite un lote de cuotas via gateway → contabilidad-ms.
 * El backend busca los contactos y calcula los montos por sí mismo.
 *
 * @param {Object} params
 * @param {number} params.codigoEmpresa
 * @param {string} params.codigoCtaCte
 * @param {number} params.mes
 * @param {number} params.anio
 * @param {number} [params.codigoContacto]  — si se pasa, emite solo para ese alumno
 * @param {number} [params.montoOverride]   — si se pasa, sobreescribe el monto calculado por fórmula
 * @returns {Promise<{generados: number, omitidos: Array}>}
 */
export const emitirLoteCuotasApi = async ({
  codigoCtaCte,
  mes,
  anio,
  codigoContacto,
  montoOverride,
}) => {
  const body = { codigoCtaCte, mes, anio };
  if (codigoContacto != null) body.codigoContacto = codigoContacto;
  if (montoOverride != null) body.montoOverride = montoOverride;
  const { data } = await axios.post(`/contabilidad/cuotas/emitir-lote`, body);
  return data;
};
