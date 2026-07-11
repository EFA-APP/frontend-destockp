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
    // El gateway espera 'codigo' en la query para el codigo
    const respuesta = await axiosInitial.patch(`/deposito/actualizar?codigo=${codigo}`, data, { showLoader: false });
    return respuesta.data;
}

export const ListarDepositosPorStockApi = async (filtros) => {
    const respuesta = await axiosInitial.get(`/deposito/listarPorStock`, { params: filtros, showLoader: false });
    return respuesta.data;
}

// Feature sin spec (2026-07-08): el PDF de "Reporte de Stock por Deposito"
// ahora se genera en el servidor (antes se armaba en el navegador con
// @react-pdf/renderer, muy lento con catalogos de 3000+ productos). Este
// endpoint devuelve el binario del PDF (responseType: 'blob'), a diferencia
// del resto de llamadas de este archivo que esperan JSON.
export const DescargarReporteStockPdfApi = async (filtros) => {
    const respuesta = await axiosInitial.get(`/deposito/reporte-stock/pdf`, {
        params: filtros,
        responseType: "blob",
        showLoader: true,
    });
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

export const EliminarDepositoApi = async (codigo, borrarStockProducto) => {
    const respuesta = await axiosInitial.patch(`/deposito/eliminar?codigo=${codigo}`, { borrarStockProducto }, { showLoader: false });
    return respuesta.data;
}
