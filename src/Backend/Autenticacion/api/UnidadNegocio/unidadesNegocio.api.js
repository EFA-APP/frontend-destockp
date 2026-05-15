import { axiosInitial } from "../../../Config";

export const obtenerUnidadesNegocioApi = async (filtros) => {
    const respuesta = await axiosInitial.get(`/unidadesNegocio/empresa`, { params: filtros, showLoader: false });
    return respuesta.data;
}

export const crearUnidadNegocioApi = async (codigoEmpresa, data) => {
    const respuesta = await axiosInitial.post(`/unidadesNegocio/crear`, data, { 
        params: { codigoEmpresa },
        showLoader: false 
    });
    return respuesta.data;
}

export const actualizarUnidadNegocioApi = async (codigo, codigoEmpresa, data) => {
    const respuesta = await axiosInitial.patch(`/unidadesNegocio/actualizar`, data, { 
        params: { codigo, codigoEmpresa },
        showLoader: false 
    });
    return respuesta.data;
}

export const eliminarUnidadNegocioApi = async (codigo, codigoEmpresa) => {
    const respuesta = await axiosInitial.delete(`/unidadesNegocio/${codigo}`, { 
        params: { codigoEmpresa },
        showLoader: false 
    });
    return respuesta.data;
}

export const vincularUsuarioAUnidadApi = async (codigoEmpresa, data) => {
    const respuesta = await axiosInitial.post(`/unidadesNegocio/vincularUsuario`, data, { 
        params: { codigoEmpresa },
        showLoader: false 
    });
    return respuesta.data;
}
