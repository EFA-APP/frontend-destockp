import { axiosInitial } from "../../../Config";

/**
 * Actualiza el estado de producción de la empresa (Switch Homo/Prod)
 */
export const actualizarEstadoProduccionApi = async (data) => {
  const respuesta = await axiosInitial.post("/empresas/actualizar-estado-produccion", data, { showLoader: true });
  return respuesta.data;
};

/**
 * Actualiza los datos fiscales maestros (CUIT, Razón Social, etc.)
 */
export const actualizarDatosFiscalesApi = async (data) => {
  const respuesta = await axiosInitial.post("/empresas/datos-fiscales", data, { showLoader: true });
  return respuesta.data;
};

/**
 * Guarda la configuración de ARCA (Certificados, Punto de Venta)
 */
export const guardarConfiguracionArcaApi = async (data) => {
  const respuesta = await axiosInitial.post("/empresas/configuracion-arca", data, { showLoader: true });
  return respuesta.data;
};
