import { axiosInitial } from "../../Config";

/**
 * Envía la petición para generar un comprobante (fiscal o no fiscal)
 * @param {Object} data - Objeto que contiene { dto, codigoEmpresa }
 */
export const GenerarComprobanteApi = async ({ dto, codigoEmpresa }) => {
    const respuesta = await axiosInitial.post(`/ventas/generar-comprobante`, dto, {
        params: { codigoEmpresa },
        showLoader: false
    });
    return respuesta.data;
}
