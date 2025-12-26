import { create } from "zustand";

export const useTamañoBarraLateral = create((set) => ({
  isExpanded: false,
  setIsExpanded: (value) => set({ isExpanded: value }),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
}));
