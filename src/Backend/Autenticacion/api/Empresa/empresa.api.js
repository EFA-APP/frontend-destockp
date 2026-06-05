import { axiosInitial } from "../../../Config";

/**
 * Actualiza el estado de producción de la empresa (Switch Homo/Prod)
 */
export const actualizarEstadoProduccionApi = async (data) => {
  const respuesta = await axiosInitial.post(
    "/empresas/actualizar-estado-produccion",
    data,
    { showLoader: true },
  );
  return respuesta.data;
};

/**
 * Actualiza los datos fiscales maestros (CUIT, Razón Social, etc.)
 */
export const actualizarDatosFiscalesApi = async (data) => {
  const respuesta = await axiosInitial.post("/empresas/datos-fiscales", data, {
    showLoader: true,
  });
  return respuesta.data;
};

/**
 * Guarda la configuración de ARCA (Certificados, Punto de Venta)
 */
export const guardarConfiguracionArcaApi = async (data) => {
  const respuesta = await axiosInitial.post(
    "/empresas/configuracion-arca",
    data,
    { showLoader: true },
  );
  return respuesta.data;
};
/**
 * Obtiene todas las empresas registradas en el sistema
 */
export const obtenerTodasLasEmpresasApi = async () => {
  const respuesta = await axiosInitial.get("/empresas/todas");
  return respuesta.data;
};

/**
 * Crea una nueva empresa en el sistema
 */
export const crearEmpresaApi = async (data) => {
  const respuesta = await axiosInitial.post("/empresas/crear", data, {
    showLoader: true,
  });
  return respuesta.data;
};
