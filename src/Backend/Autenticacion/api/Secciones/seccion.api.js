import { axiosInitial } from "../../../Config";
 
 export const fetchObtenerSeccionesApi = async () => {
     const respuesta = await axiosInitial.get("/secciones/obtener", { showLoader: false });
     return respuesta.data;
 };
