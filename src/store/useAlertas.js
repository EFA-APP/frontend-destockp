import { create } from "zustand";

export const useAlertas = create((set) => ({
  alertas: [],

  agregarAlerta: (alerta) => {
    const id = Date.now();
    set(() => ({
      alertas: [{ ...alerta, id }],
    }));

    if (alerta.autoDismiss !== false) {
      setTimeout(() => {
        set((state) => ({
          alertas: state.alertas.filter((a) => a.id !== id),
        }));
      }, 5000);
    }
  },

  eliminarAlerta: (id) => {
    set((state) => ({
      alertas: state.alertas.filter((alerta) => alerta.id !== id),
    }));
  },

  limpiarAlerta: () => set({ alertas: [] }),
}));
