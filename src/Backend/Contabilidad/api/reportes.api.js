import { axiosInitial } from "../../Config";

export const reportesContablesApi = {
  obtenerLibroMayor: async (params) => {
    const { data } = await axiosInitial.get(
      "/contabilidad/reportes/libro-mayor",
      { params },
    );
    return data;
  },
};
