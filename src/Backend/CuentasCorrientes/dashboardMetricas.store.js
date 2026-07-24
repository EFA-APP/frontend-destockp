import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDashboardMetricasStore = create(
  persist(
    (set) => ({
      metricasActivas: {
        totales: true,
        evolucion: true,
      },
      toggleMetrica: (clave) =>
        set((state) => ({
          metricasActivas: {
            ...state.metricasActivas,
            [clave]: !state.metricasActivas[clave],
          },
        })),
    }),
    {
      name: 'cuenta-corriente-dashboard-metricas',
    }
  )
);
