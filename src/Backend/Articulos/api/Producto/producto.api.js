import { axiosInitial } from "../../../Config";

export const ObtenerProductosApi = async (filtros) => {
    const respuesta = await axiosInitial.get(`/producto/obtener`, { params: filtros, showLoader: false });
    return respuesta.data;
}

export const CrearProductoApi = async (data) => {
    const respuesta = await axiosInitial.post(`/producto/crear`, data, { showLoader: false });
    return respuesta.data;
}

export const ActualizarProductoApi = async (codigo, data) => {
    const respuesta = await axiosInitial.patch(`/producto/actualizar?codigo=${codigo}`, data, { showLoader: false });
    return respuesta.data;
}

export const ListarConfiguracionCamposApi = async (entidad) => {
    const respuesta = await axiosInitial.get(`/producto/configuracion/listar`, { params: { entidad }, showLoader: false });
    return respuesta.data;
}

export const ImportarProductosApi = async (productos) => {
    const respuesta = await axiosInitial.post(`/producto/importar`, productos, { showLoader: true });
    return respuesta.data;
}