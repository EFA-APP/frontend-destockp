import { axiosInitial } from "../../../Config";

export const ObtenerPermisosApi = async (filtros) => {
    const response = await axiosInitial.get(`/permisos`, { params: filtros, showLoader: false });
    return response.data;
}

export const actualizarAccionesPermisoApi = async ({ codigo, codigoEmpresa, acciones }) => {
    const response = await axiosInitial.patch(`/permisos/${codigo}/acciones`, { acciones }, { 
        params: { codigoEmpresa },
        showLoader: false 
    });
    return response.data;
};

export const fetchObtenerTodasLasAccionesApi = async ({ codigoEmpresa }) => {
    const response = await axiosInitial.get(`/permisos/acciones`, { 
        params: { codigoEmpresa },
        showLoader: false 
    });
    return response.data;
};

export const fetchObtenerTodasLasAccionesGlobalesApi = async () => {
    const response = await axiosInitial.get(`/permisos/acciones/globales`, { showLoader: false });
    return response.data;
};