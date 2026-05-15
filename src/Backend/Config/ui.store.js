import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarLocked: true, // Por defecto fija
      sidebarHovered: false,
      
      toggleSidebarLock: () => set((state) => ({ sidebarLocked: !state.sidebarLocked })),
      setSidebarHovered: (hovered) => set({ sidebarHovered: hovered }),
    }),
    {
      name: "ui-storage", // Nombre en localStorage
    }
  )
);
