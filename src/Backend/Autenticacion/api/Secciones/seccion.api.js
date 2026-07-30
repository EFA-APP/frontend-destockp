import { axiosInitial } from "../../../Config";

// Seccion es un catálogo GLOBAL desde rbac-normalizacion-secciones-permisos
// (R6, R18, R20): ya no se filtra ni se envía codigoEmpresa.
export const fetchObtenerSeccionesApi = async () => {
    const respuesta = await axiosInitial.get("/secciones/obtener", { showLoader: false });
    return respuesta.data;
};

export const crearSeccionApi = async (data) => {
    const respuesta = await axiosInitial.post("/secciones/crear", data, {
        showLoader: false
    });
    return respuesta.data;
};

export const fetchObtenerSeccionesGlobalesApi = async () => {
    const respuesta = await axiosInitial.get("/secciones/global", { showLoader: false });
    return respuesta.data;
};

export const editarSeccionApi = async (data) => {
    const respuesta = await axiosInitial.patch("/secciones/editar", data, {
        showLoader: false
    });
    return respuesta.data;
};

export const eliminarSeccionApi = async ({ codigo }) => {
    const respuesta = await axiosInitial.delete("/secciones/eliminar", {
        params: { codigo },
        showLoader: false
    });
    return respuesta.data;
};
