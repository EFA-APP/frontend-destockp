import { axiosInitial } from "../../../Config";

export const ObtenerDepositosApi = async (filtros) => {
    const respuesta = await axiosInitial.get(`/deposito/obtener`, { params: filtros, showLoader: false });
    return respuesta.data;
}

export const CrearDepositoApi = async (data) => {
    const respuesta = await axiosInitial.post(`/deposito/crear`, data, { showLoader: false });
    return respuesta.data;
}

export const ActualizarDepositoApi = async (codigo, data) => {
    // El gateway espera 'codigo' en la query para el codigoSecuencial
    const respuesta = await axiosInitial.patch(`/deposito/actualizar?codigoSecuencial=${codigo}`, data, { showLoader: false });
    return respuesta.data;
}

export const ListarDepositosPorStockApi = async (filtros) => {
    const respuesta = await axiosInitial.get(`/deposito/listarPorStock`, { params: filtros, showLoader: false });
    return respuesta.data;
}

export const ActualizarDepositoPorStockApi = async (data) => {
    const respuesta = await axiosInitial.patch(`/stockDeposito/actualizar`, data, { showLoader: false });
    return respuesta.data;
}

export const TransferirDepositoPorStockApi = async (data) => {
    const respuesta = await axiosInitial.patch(`/stockDeposito/transferir`, data, { showLoader: false });
    return respuesta.data;
}
