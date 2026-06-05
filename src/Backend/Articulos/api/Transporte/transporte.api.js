import { axiosInitial } from "../../../Config";

// --- RUTAS ---
export const getRutas = async () => {
  const { data } = await axiosInitial.get("/transporte/rutas");
  return data;
};

export const crearRuta = async (rutaData) => {
  const { data } = await axiosInitial.post("/transporte/rutas", rutaData);
  return data;
};

export const actualizarRuta = async ({ id, ...rutaData }) => {
  const { data } = await axiosInitial.put(`/transporte/rutas/${id}`, rutaData);
  return data;
};

export const eliminarRuta = async (id) => {
  const { data } = await axiosInitial.put(`/transporte/rutas/${id}/eliminar`);
  return data;
};

// --- ENVIOS ---
export const getEnvios = async (fecha) => {
  const { data } = await axiosInitial.get("/transporte/envios", {
    params: { fecha },
  });
  return data;
};

export const crearEnvio = async (envioData) => {
  const { data } = await axiosInitial.post("/transporte/envios", envioData);
  return data;
};

export const actualizarEstadoEnvio = async ({ id, estadoDespacho }) => {
  const { data } = await axiosInitial.put(`/transporte/envios/${id}/estado`, {
    estadoDespacho,
  });
  return data;
};

export const getEnviosNoFacturados = async (codigoRemitente) => {
  const params = codigoRemitente ? { codigoRemitente } : {};
  const { data } = await axiosInitial.get("/transporte/envios/no-facturados", {
    params,
  });
  return data;
};

export const facturarEnvios = async ({ enviosIds, codigoComprobante }) => {
  const { data } = await axiosInitial.post("/transporte/envios/facturar", {
    enviosIds,
    codigoComprobante,
  });
  return data;
};
