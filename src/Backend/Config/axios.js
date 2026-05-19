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
      const showLoader =
        config.showLoader !== undefined
          ? config.showLoader
          : config.method !== "get";

      if (showLoader) {
        useCargadorStore.getState().setCargando(true);
      }

      // 🔐 Token
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 🏢 Contexto de Empresa y Unidad de Negocio
      const { usuario } = useAuthStore.getState();

      if (usuario?.codigoEmpresa && !config.sinEmpresa) {
        config.params = {
          codigoEmpresa: usuario.codigoEmpresa, // Valor por defecto (sesión)
          ...config.params, // Sobrescribe con el valor explícito si existe
        };
      } else if (config.sinEmpresa && config.params) {
        delete config.params.codigoEmpresa;
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
