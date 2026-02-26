import { useAuthStore } from "./store/authenticacion.store";

export const cerrarSesion = () => {
  useAuthStore.getState().clearAuth();
  window.location.replace("/");
};