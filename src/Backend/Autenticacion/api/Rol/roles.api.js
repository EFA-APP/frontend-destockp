import { axiosInitial } from "../../../Config";

export const obtenerRolesApi = async (filtros) => {
    const respuesta = await axiosInitial.get(`/roles`, { params: filtros, showLoader: false });
    return respuesta.data;
}

export const crearRolesApi = async (codigoEmpresa, data) => {
    const respuesta = await axiosInitial.post(`/roles/crear`, data, { 
        params: { codigoEmpresa },
        showLoader: false 
    });
    return respuesta.data;
}

export const asignarRolApi = async (data) => {
    const respuesta = await axiosInitial.post(`/roles/asignarRol`, data, { showLoader: false, checkAuth: true  });
    return respuesta.data;
}

export const actualizarRolApi = async (codigo, codigoEmpresa, data) => {
    const respuesta = await axiosInitial.patch(`/roles/actualizar`, data, { 
        params: { codigo, codigoEmpresa },
        showLoader: false, 
        checkAuth: true 
    });
    return respuesta.data;
}

export const eliminarRolApi = async (codigo, codigoEmpresa) => {
    const respuesta = await axiosInitial.delete(`/roles/${codigo}`, { 
        params: { codigoEmpresa },
        showLoader: false, 
        checkAuth: true 
    });
    return respuesta.data;
}
