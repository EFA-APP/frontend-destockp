import { axiosInitial } from "../../Config";

export const configuracionApi = {
  obtenerMapeos: async (params) => {
    const { data } = await axiosInitial.get("/contabilidad/configuracion/mapeo", { 
      params,
      sinEmpresa: true
    });
    return data;
  },
  guardarMapeo: async (payload, params) => {
    const { data } = await axiosInitial.post("/contabilidad/configuracion/mapeo", payload, { 
      params,
      sinEmpresa: true
    });
    return data;
  },
  eliminarMapeo: async (payload, params) => {
    const { data } = await axiosInitial.post("/contabilidad/configuracion/mapeo/eliminar", payload, { 
      params,
      sinEmpresa: true
    });
    return data;
  }
};
