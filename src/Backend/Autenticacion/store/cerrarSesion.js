import { useAuthStore } from "./authenticacion.store";

export const cerrarSesion = () => {
  useAuthStore.getState().clearAuth();
  window.location.replace("/");
};