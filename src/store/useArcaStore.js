import { create } from "zustand";
import { IniciarSesionArcaApi } from "../Backend/Arca/api/arca.api";

export const useArcaStore = create((set) => ({
  conectado: false,
  expiracion: null,
  cargando: false,
  mensaje: "",
  infoIva: null,
  arcaConfig: null, // Guardamos aquí el encabezado fiscal

  setConexion: (status, expiracion, mensaje = "") =>
    set({ conectado: status, expiracion, mensaje }),

  verificarSesion: async (empresa) => {
    if (!empresa?.conexionArca && !empresa?.configuracionArca?.activo) {
      set({
        conectado: false,
        mensaje: "ARCA no habilitado para esta empresa",
      });
      return;
    }

    set({ cargando: true });
    try {
      const res = await IniciarSesionArcaApi();
      if (res.success) {
        set({
          conectado: true,
          expiracion: res.data?.expiration,
          arcaConfig: res.data?.encabezado || null, // Guardamos el encabezado fiscal precargado
          infoIva: res.iva || null,
          mensaje: res.message,
          cargando: false,
        });
      } else {
        set({ conectado: false, infoIva: null, arcaConfig: null, mensaje: res.message, cargando: false });
      }
    } catch (error) {
      console.error("[ARCA_STORE_ERROR]", error);
      set({
        conectado: false,
        mensaje: "Error de conexión con el servidor ARCA",
        cargando: false,
      });
    }
  },
}));
