import { axiosInitial } from "../../Config";

const URL_BASE = "/comprobantes/cheque-tercero";

export const listarCarteraChequeTercero = async (filtros = {}) => {
  const cleanFiltros = Object.fromEntries(
    Object.entries(filtros).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
  );

  const { data } = await axiosInitial.get(`${URL_BASE}/cartera`, {
    params: cleanFiltros,
    showLoader: false,
  });
  return data;
};

export const listarChequeTerceroDisponibles = async (busqueda = "") => {
  const params = {};
  if (busqueda) params.busqueda = busqueda;

  const { data } = await axiosInitial.get(`${URL_BASE}/disponibles`, {
    params,
    showLoader: false,
  });
  return data;
};

export const rechazarChequeTercero = async (codigo) => {
  const { data } = await axiosInitial.patch(
    `${URL_BASE}/${codigo}/rechazar`,
    {},
    { showLoader: true }
  );
  return data;
};

// R16 (origen DEPOSITADO) y R18 (origen RECHAZADO, re-presentación):
// importeCobrado es opcional, solo se usa cuando difiere del importe
// original del cheque. Feature cheques-terceros-integracion-bancos (R39):
// codigoCuentaBancaria (CuentaBancaria real de tesoreria-ms) reemplaza a
// codigoCuentaDestino (cuenta del plan contable elegida a mano).
export const cobrarChequeTercero = async (codigo, codigoCuentaBancaria, importeCobrado) => {
  const { data } = await axiosInitial.patch(
    `${URL_BASE}/${codigo}/cobrar`,
    { codigoCuentaBancaria, importeCobrado },
    { showLoader: true }
  );
  return data;
};

// R12: endoso a un proveedor registrado en el sistema.
export const endosarChequeTercero = async (codigo, datosEndoso) => {
  const { data } = await axiosInitial.post(
    `${URL_BASE}/${codigo}/endosar`,
    datosEndoso,
    { showLoader: true }
  );
  return data;
};

// R13: entrega a un tercero NO registrado como proveedor.
export const entregarChequeATercero = async (codigo, entregadoATercero) => {
  const { data } = await axiosInitial.post(
    `${URL_BASE}/${codigo}/entregar-a-tercero`,
    { entregadoATercero },
    { showLoader: true }
  );
  return data;
};

// R14. codigoCuentaBancaria e importeCobrado son obligatorios: tesoreria-ms
// genera 2 asientos contables (neto + comisión) a partir de estos datos.
// Feature cheques-terceros-integracion-bancos (R39): codigoCuentaBancaria
// (CuentaBancaria real de tesoreria-ms) reemplaza a codigoCuentaDestino.
export const descontarChequeTercero = async (codigo, codigoCuentaBancaria, importeCobrado) => {
  const { data } = await axiosInitial.post(
    `${URL_BASE}/${codigo}/descontar`,
    { codigoCuentaBancaria, importeCobrado },
    { showLoader: true }
  );
  return data;
};

// R15.
export const anularChequeTercero = async (codigo) => {
  const { data } = await axiosInitial.post(
    `${URL_BASE}/${codigo}/anular`,
    {},
    { showLoader: true }
  );
  return data;
};

// R21, R36: historial de auditoría de un cheque.
export const obtenerHistorialChequeTercero = async (codigo) => {
  const { data } = await axiosInitial.get(
    `${URL_BASE}/${codigo}/historial`,
    { showLoader: false }
  );
  return data;
};
