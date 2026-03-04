import { axiosInitial } from "../../../config";

export const ObtenerPermisosApi = async () => {
    try {
        const response = await axiosInitial.get(`/permisos`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener los permisos:", error);
        return [];
    }
}