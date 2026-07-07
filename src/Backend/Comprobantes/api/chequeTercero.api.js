import { axiosInitial } from "../../Config";

const URL_BASE = "/comprobantes/cheque-tercero";

export const listarCarteraChequeTercero = async (filtros = {}) => {
  const cleanFiltros = Object.fromEntries(
    Object.entries(filtros).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
  );

  const { data } = await axiosInitial.get(`${URL_BASE}/cartera`, {
    params: cleanFiltros,
    showLoader: false,
    sinEmpresa: true,
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

export const depositarChequeTercero = async (codigo, codigoCuentaDestino) => {
  const { data } = await axiosInitial.patch(
    `${URL_BASE}/${codigo}/depositar`,
    { codigoCuentaDestino },
    { showLoader: true }
  );
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

export const cobrarChequeTercero = async (codigo, codigoCuentaDestino) => {
  const { data } = await axiosInitial.patch(
    `${URL_BASE}/${codigo}/cobrar`,
    { codigoCuentaDestino },
    { showLoader: true }
  );
  return data;
};
