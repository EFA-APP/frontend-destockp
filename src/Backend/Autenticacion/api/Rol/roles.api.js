import { axiosInitial } from "../../../config";

export const obtenerRolesApi = async () => {
    const respuesta = await axiosInitial.get(`/roles`, { showLoader: true });
    return respuesta.data;
}

export const crearRolesApi = async (data) => {
    const respuesta = await axiosInitial.post(`/roles/crear`, data, { showLoader: false });
    return respuesta.data;
}