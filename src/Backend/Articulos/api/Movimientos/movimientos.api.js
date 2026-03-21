import { axiosInitial } from "../../../Config";

export const CrearMovimientoApi = async (data) => {
  const response = await axiosInitial.post(`/movimientos/crear`, data, { showLoader: false });
  return response.data;
};

export const ObtenerMovimientosApi = async (params) => {
  const response = await axiosInitial.get(`/movimientos/obtener`, { params, showLoader: false });
  return response.data;
};

export const EliminarMovimientoApi = async ({ codigoEmpresa, codigoSecuencial, tipoArticulo }) => {
  const response = await axiosInitial.delete(`/movimientos/eliminar/${codigoSecuencial}`, {
    params: { codigoEmpresa, tipoArticulo },
    showLoader: true
  });
  return response.data;
};
