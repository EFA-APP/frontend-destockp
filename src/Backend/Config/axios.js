import axios from "axios";
import useCargadorStore from "../../store/useCargadorStore";
import { useAlertas } from "../../store/useAlertas";
import { useAuthStore } from "../Autenticacion/store/authenticacion.store";

const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    mode: "no-cors",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const agregarAlerta = useAlertas.getState().agregarAlerta;

  // 🔹 REQUEST
  instance.interceptors.request.use(
    (config) => {
      const showLoader = config.showLoader !== undefined 
        ? config.showLoader 
        : config.method !== 'get';

      if (showLoader) {
        useCargadorStore.getState().setCargando(true);
      }

      // 🔐 Token
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 🏢 Contexto de Empresa y Unidad de Negocio
      const { usuario, unidadActiva } = useAuthStore.getState();

      if (usuario?.codigoEmpresa) {
        // if (usuario?.codigoEmpresa || unidadActiva?.codigoSecuencial) {
        config.params = {
          ...(usuario?.codigoEmpresa && {
            codigoEmpresa: usuario.codigoEmpresa,
          }),
          // ...(unidadActiva?.codigoSecuencial && { codigoUnidadNegocio: unidadActiva.codigoSecuencial }),
          ...config.params,
        };
      }

      return config;
    },
    (error) => {
      useCargadorStore.getState().setCargando(false);
      return Promise.reject(error);
    },
  );

  // 🔹 RESPONSE
  instance.interceptors.response.use(
    (response) => {
      useCargadorStore.getState().setCargando(false);
      return response;
    },
    (error) => {
      useCargadorStore.getState().setCargando(false);

      if (error.response?.status === 401) {
        agregarAlerta({
          type: "error",
          message:
            "Sesión expirada o inválida. Por favor, inicie sesión nuevamente.",
        });
        useAuthStore.getState().clearAuth(); // 🔐 Limpiar estado y forzar redirección
      }

      if (error.response?.status === 403) {
        agregarAlerta({
          type: "warning",
          message: "No tiene permisos suficientes para realizar esta acción.",
        });
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

export default createAxiosInstance;
