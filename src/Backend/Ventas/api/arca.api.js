import { axiosInitial } from "../../Config";

/**
 * Inicia o recupera la sesión de ARCA (AFIP) para la empresa actual.
 * El interceptor de axios ya adjunta el codigoEmpresa automáticamente.
 */
export const IniciarSesionArcaApi = async () => {
    const respuesta = await axiosInitial.get(`/arca/sesion/iniciar`, { showLoader: false });
    return respuesta.data;
};
