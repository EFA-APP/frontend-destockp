import { useMemo } from "react";
import { useAuthStore } from "../store/authenticacion.store";

/**
 * Hook para centralizar la lógica de permisos del usuario.
 * Lee del authStore (que persiste en Local Storage) para garantizar consistencia.
 */
export const useUserPermissions = () => {
  const usuario = useAuthStore((state) => state.usuario);

  // Extraemos todos los códigos de sección permitidos del usuario
  const codigosSeccionPermitidos = useMemo(() => {
    if (!usuario?.roles) return [];

    const codigos = new Set();
    usuario.roles.forEach((rol) => {
      if (rol.permisos && Array.isArray(rol.permisos)) {
        rol.permisos.forEach((p) => {
          if (p.codigoSeccion) codigos.add(p.codigoSeccion);
        });
      }
    });

    return Array.from(codigos);
  }, [usuario]);

  /**
   * Verifica si el usuario tiene permiso para un código específico.
   * @param {string} codigo - El código de la sección (ej: 'CONF', 'ART')
   * @returns {boolean}
   */
  const tienePermiso = (codigo) => {
    if (!codigo) return true;
    return codigosSeccionPermitidos.includes(codigo);
  };

  return {
    codigosSeccionPermitidos,
    tienePermiso,
    usuario
  };
};
