import { axiosInitial } from "../../../Config";

export const ObtenerMateriasPrimasApi = async (filtros) => {
    const respuesta = await axiosInitial.get(`/materiaPrima/obtener`, { params: filtros, showLoader: false });
    return respuesta.data;
}

export const CrearMateriaPrimaApi = async (data) => {
    const respuesta = await axiosInitial.post(`/materiaPrima/crear`, data, { showLoader: false });
    return respuesta.data;
}

export const ActualizarMateriaPrimaApi = async (id, data) => {
    const respuesta = await axiosInitial.patch(`/materiaPrima/actualizar/${id}`, data, { showLoader: false });
    return respuesta.data;
}

export const EliminarMateriaPrimaApi = async (id) => {
    const respuesta = await axiosInitial.delete(`/materiaPrima/eliminar/${id}`, { showLoader: false });
    return respuesta.data;
}