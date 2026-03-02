import { axiosInitial } from "../../../config";

export const obtenerRolesApi = async (filtros) => {
    const respuesta = await axiosInitial.get(`/roles`, { params: filtros, showLoader: false });
    return respuesta.data;
}

export const crearRolesApi = async (data) => {
    const respuesta = await axiosInitial.post(`/roles/crear`, data, { showLoader: false });
    return respuesta.data;
}