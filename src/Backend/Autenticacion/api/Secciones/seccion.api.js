import { axiosInitial } from "../../../Config";
 
 export const fetchObtenerSeccionesApi = async (filtros) => {
     const respuesta = await axiosInitial.get("/secciones/obtener", { params: filtros, showLoader: false });
     return respuesta.data;
 };

 export const crearSeccionApi = async ({ codigoEmpresa, ...data }) => {
    const respuesta = await axiosInitial.post("/secciones/crear", data, { 
        params: { codigoEmpresa },
        showLoader: false 
    });
    return respuesta.data;
};

export const fetchObtenerSeccionesGlobalesApi = async () => {
    const respuesta = await axiosInitial.get("/secciones/global", { showLoader: false });
    return respuesta.data;
};

export const editarSeccionApi = async ({ codigoEmpresa, ...data }) => {
    const respuesta = await axiosInitial.patch("/secciones/editar", data, { 
        params: { codigoEmpresa },
        showLoader: false 
    });
    return respuesta.data;
};

export const eliminarSeccionApi = async ({ codigoEmpresa, codigo }) => {
    const respuesta = await axiosInitial.delete("/secciones/eliminar", { 
        params: { codigoEmpresa, codigo },
        showLoader: false 
    });
    return respuesta.data;
};
