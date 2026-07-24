import { axiosInitial } from "../../Config";

const URL_BASE = "/cheques-propios";

// Feature "bancos" (T46, R71, R73): ciclo de vida de ChequePropio, mismo
// patrón que chequeTercero.api.js.
export const listarCarteraChequePropio = async (filtros = {}) => {
  const cleanFiltros = Object.fromEntries(
    Object.entries(filtros).filter(([_, v]) => v !== "" && v !== null && v !== undefined),
  );

  const { data } = await axiosInitial.get(URL_BASE, {
    params: cleanFiltros,
    showLoader: false,
  });
  return data;
};

export const obtenerHistorialChequePropio = async (codigo, codigoEmpresa) => {
  const { data } = await axiosInitial.get(`${URL_BASE}/${codigo}/historial`, {
    params: { codigoEmpresa },
    showLoader: false,
  });
  return data;
};

// R53: EMITIDO -> ENTREGADO.
export const entregarChequePropio = async (codigo, codigoEmpresa, { destinatario, observaciones } = {}) => {
  const { data } = await axiosInitial.post(
    `${URL_BASE}/${codigo}/entregar`,
    { destinatario, observaciones },
    { params: { codigoEmpresa }, showLoader: true },
  );
  return data;
};

// R54 (origen ENTREGADO) y R56 (re-presentación desde RECHAZADO): mismo
// endpoint para ambos orígenes, resuelto en tesoreria-ms.
export const cobrarChequePropio = async (codigo, codigoEmpresa, { observaciones } = {}) => {
  const { data } = await axiosInitial.post(
    `${URL_BASE}/${codigo}/cobrar`,
    { observaciones },
    { params: { codigoEmpresa }, showLoader: true },
  );
  return data;
};

// R55: ENTREGADO -> RECHAZADO.
export const rechazarChequePropio = async (codigo, codigoEmpresa, { motivoRechazo, observaciones } = {}) => {
  const { data } = await axiosInitial.post(
    `${URL_BASE}/${codigo}/rechazar`,
    { motivoRechazo, observaciones },
    { params: { codigoEmpresa }, showLoader: true },
  );
  return data;
};

// R57: {EMITIDO, ENTREGADO} -> ANULADO.
export const anularChequePropio = async (codigo, codigoEmpresa, { observaciones } = {}) => {
  const { data } = await axiosInitial.post(
    `${URL_BASE}/${codigo}/anular`,
    { observaciones },
    { params: { codigoEmpresa }, showLoader: true },
  );
  return data;
};
