import { axiosInitial } from "../../../Config";


export const obtenerComprobantesPaginados = async (filtros) => {
  const { data } = await axiosInitial.get("/ventas/obtener", {
    params: {
      ...filtros,
    },
    showLoading: false,
  });
  return data;
};

export const generarComprobante = async (payload) => {
  const { data } = await axiosInitial.post("/ventas/generar-comprobante", payload, {
    showLoading: false,
  });
  return data;
};
