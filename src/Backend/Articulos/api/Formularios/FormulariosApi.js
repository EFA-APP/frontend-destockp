import { axiosInitial } from "../../../Config";

export const obtenerPlantillaFormulario = async (entidad) => {
  const response = await axiosInitial.get("/formularios/obtener", {
    params: { entidad },
  });
  return response.data;
};
