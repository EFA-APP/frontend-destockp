import { axiosInitial } from "../../../Config";

export const CrearMovimientoApi = async (data) => {
  const response = await axiosInitial.post(`/movimientos/crear`, data, { showLoader: false });
  return response.data;
};

export const ObtenerMovimientosApi = async (params) => {
  const response = await axiosInitial.get(`/movimientos/obtener`, { params, showLoader: false });
  return response.data;
};
