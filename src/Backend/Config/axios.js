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
      // Loader
      if (config.showLoader !== false) {
        useCargadorStore.getState().setCargando(true);
      }

      // 🔐 Token
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 🏢 Código de Empresa
      const usuario = useAuthStore.getState().usuario;
      if (usuario?.codigoEmpresa) {
        config.params = {
          ...config.params,
          codigoEmpresa: usuario?.codigoEmpresa,
        };
      }

      return config;
    },
    (error) => {
      useCargadorStore.getState().setCargando(false);
      return Promise.reject(error);
    }
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
        // 🚨 Solo mostrar alerta si intentamos mandar un token y falló
        if (error.config?.headers?.Authorization) {
          agregarAlerta({
            type: "error",
            message: "Sesión expirada o inválida. Por favor, inicie sesión nuevamente."
          });
        }
        useAuthStore.getState().clearAuth(); // 🔐 Limpiar estado y forzar redirección
      }

      if (error.response?.status === 403) {
        agregarAlerta({
          type: "warning",
          message: "No tiene permisos suficientes para realizar esta acción."
        });
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export default createAxiosInstance;