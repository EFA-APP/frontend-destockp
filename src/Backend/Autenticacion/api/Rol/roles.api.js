import { axiosInitial } from "../../../Config";

export const obtenerRolesApi = async (filtros) => {
    const respuesta = await axiosInitial.get(`/roles`, { params: filtros, showLoader: false });
    return respuesta.data;
}

export const crearRolesApi = async (data) => {
    const respuesta = await axiosInitial.post(`/roles/crear`, data, { showLoader: false });
    return respuesta.data;
}

export const asignarRolApi = async (data) => {
    const respuesta = await axiosInitial.post(`/roles/asignarRol`, data, { showLoader: false, checkAuth: true  });
    return respuesta.data;
}

export const actualizarRolApi = async (codigo, data) => {
    const respuesta = await axiosInitial.patch(`/roles/actualizar?codigo=${codigo}`, data, { showLoader: false, checkAuth: true });
    return respuesta.data;
}
