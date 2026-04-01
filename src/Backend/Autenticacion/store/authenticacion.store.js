import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      unidadActiva: null,

      setAuth: ({ token, usuario }) =>
        set({ token, usuario }),

      setUnidadActiva: (unidadActiva) =>
        set({ unidadActiva }),

      setUsuario: (usuario) =>
        set({ usuario }),

      clearAuth: () =>
        set({ token: null, usuario: null, unidadActiva: null }),
    }),
    {
      name: "auth",
      partialize: (s) => ({
        token: s.token,
        usuario: s.usuario,
        unidadActiva: s.unidadActiva,
      }),
    }
  )
);
