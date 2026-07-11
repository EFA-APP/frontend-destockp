import { axiosInitial } from "../../Config";

export const reportesContablesApi = {
  obtenerLibroMayor: async (params) => {
    const { data } = await axiosInitial.get(
      "/contabilidad/reportes/libro-mayor",
      { params },
    );
    return data;
  },
  obtenerCuentasConMovimientos: async (params) => {
    const { data } = await axiosInitial.get(
      "/contabilidad/reportes/cuentas-con-movimientos",
      { params },
    );
    return data;
  },
};
