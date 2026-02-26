import {create} from 'zustand'; // Usamos `create` en lugar de `default`

const useCargadorStore = create((set) => ({
  cargando: false,  // Estado para controlar el loader
  setCargando: (isCargando) => set({ cargando: isCargando }), // Función para actualizar el estado
}));

export default useCargadorStore;
