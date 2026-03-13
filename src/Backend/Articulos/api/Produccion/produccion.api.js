import { axiosInitial } from "../../../Config";

export const IngresarProduccionApi = async (data) => {
    try {
        const response = await axiosInitial.post(`/produccion/ingresar`, data, {showLoader: false});
        return response.data;
    } catch (error) {
        throw error;
    }
};
