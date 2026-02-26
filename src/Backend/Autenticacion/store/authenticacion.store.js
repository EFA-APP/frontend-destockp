import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      usuario: null,

      setAuth: ({ token, usuario }) =>
        set({ token, usuario }),

      clearAuth: () =>
        set({ token: null, usuario: null }),
    }),
    {
      name: "auth",
      partialize: (s) => ({
        token: s.token,
        usuario: s.usuario,
      }),
    }
  )
);
