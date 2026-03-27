import { useState, useEffect } from 'react';

/**
 * Hook que funciona igual que useState pero persiste el valor en sessionStorage.
 * @param {string} key - Clave única para identificar el estado en el almacenamiento.
 * @param {any} initialValue - Valor inicial si no hay nada guardado.
 * @returns {[any, function]} - Par [estado, setEstado]
 */
export const usePersistentState = (key, initialValue) => {
  const [state, setState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`persistent_${key}`);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch (e) {
      console.error(`Error loading persistent state for key "${key}":`, e);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(`persistent_${key}`, JSON.stringify(state));
    } catch (e) {
      console.error(`Error saving persistent state for key "${key}":`, e);
    }
  }, [key, state]);

  return [state, setState];
};
