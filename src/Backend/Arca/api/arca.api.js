import { axiosInitial } from "../../Config";

/**
 * Inicia o recupera la sesión de ARCA (AFIP) para la empresa actual.
 * El interceptor de axios ya adjunta el codigoEmpresa automáticamente.
 */
export const IniciarSesionArcaApi = async () => {
  const respuesta = await axiosInitial.get(`/arca/sesion/iniciar`, {
    showLoader: false,
  });
  return respuesta.data;
};

/**
 * Obtiene los tipos de comprobantes habilitados por AFIP/ARCA.
 */
export const ObtenerTiposComprobanteApi = async () => {
  const respuesta = await axiosInitial.get(`/arca/comprobantes/tipos`, {
    showLoader: false,
  });
  return respuesta.data;
};
