import { axiosInitial } from "../../Config";

export const reportesContablesApi = {
  obtenerLibroMayor: async (params) => {
    const { data } = await axiosInitial.get("/contabilidad/reportes/libro-mayor", { params });
    return data;
  },
  obtenerBalance: async (params) => {
    const { data } = await axiosInitial.get("/contabilidad/reportes/balance", { params });
    return data;
  },
  obtenerBalanceGeneral: async (params) => {
    const { data } = await axiosInitial.get("/contabilidad/reportes/balance-general", { params });
    return data;
  }
};
