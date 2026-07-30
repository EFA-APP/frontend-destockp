import { useMemo } from "react";
import { useAuthStore } from "../../store/authenticacion.store";

/**
 * Hook para centralizar la lógica de permisos del usuario.
 * Lee del authStore (que persiste en Local Storage) para garantizar consistencia.
 *
 * rbac-normalizacion-secciones-permisos (R35, R36): `usuario.secciones` ya
 * llega resuelto server-side (RolSeccionAccion + restricción de
 * UsuarioAccionHabilitada aplicada, R34) — este hook solo aplana la
 * estructura, sin reevaluar ninguna comparación de usuario/empresa.
 *
 * Revisión 3 (R67, R68): `usuario.secciones` pasa a una estructura anidada
 * Sección -> SubMenus -> Acciones (antes Sección -> Acciones directo). El
 * contrato expuesto por este hook (codigosSeccionPermitidos,
 * accionesPermitidas, tienePermiso, tieneAccion) NO cambia: una Sección se
 * considera accesible si al menos uno de sus SubMenus tiene alguna Acción
 * concedida (R68); el criterio de filtrado de BarraLateral.jsx/
 * NavbarMovil.jsx/Articulo.jsx se conserva tal cual (R37/R24 de la
 * Revisión 2: una Sección visible sigue mostrando todos sus SubMenus
 * activos, no solo los que tienen Acciones concedidas — R69 deja ese
 * filtrado más fino explícitamente fuera de alcance de esta revisión).
 * 
 * Update: Se agregó `nombresSubMenuPermitidos` para permitir un filtrado 
 * fino a nivel de Submenú en BarraLateral y NavbarMovil.
 */
export const usePermisosDeUsuario = () => {
  const usuario = useAuthStore((state) => state.usuario);

  // Códigos de Sección a los que el usuario tiene algún acceso: al menos
  // un SubMenu de la Sección con alguna Acción concedida (R68).
  const codigosSeccionPermitidos = useMemo(() => {
    if (!usuario?.secciones) return [];
    return usuario.secciones
      .filter((s) => (s.subMenus || []).some((sm) => (sm.acciones || []).length > 0))
      .map((s) => s.codigoSeccion);
  }, [usuario]);

  // Nombres de los submenús a los que el usuario tiene acceso (es decir,
  // aquellos que tienen al menos una Acción concedida).
  const nombresSubMenuPermitidos = useMemo(() => {
    if (!usuario?.secciones) return [];
    const submenus = new Set();
    usuario.secciones.forEach((s) => {
      (s.subMenus || []).forEach((sm) => {
        if ((sm.acciones || []).length > 0) {
          submenus.add(sm.nombre);
        }
      });
    });
    return Array.from(submenus);
  }, [usuario]);

  // Todas las acciones efectivas del usuario (ya resueltas por el backend),
  // aplanando secciones[].subMenus[].acciones (antes secciones[].acciones
  // directo).
  const accionesPermitidas = useMemo(() => {
    if (!usuario?.secciones) return [];

    const acciones = new Set();
    usuario.secciones.forEach((s) => {
      (s.subMenus || []).forEach((sm) => {
        (sm.acciones || []).forEach((nombre) => acciones.add(nombre.toUpperCase()));
      });
    });
    return Array.from(acciones);
  }, [usuario]);

  const tienePermiso = (codigo) => {
    if (!codigo) return true;
    return codigosSeccionPermitidos.includes(codigo);
  };

  const tieneAccion = (accion) => {
    if (!accion) return true;

    const accionNormalizada = accion.toUpperCase();
    return accionesPermitidas.includes(accionNormalizada);
  };

  return {
    codigosSeccionPermitidos,
    nombresSubMenuPermitidos,
    accionesPermitidas,
    tienePermiso,
    tieneAccion,
    usuario,
  };
};
