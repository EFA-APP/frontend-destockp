import { useMemo } from "react";
import { useAuthStore } from "../../store/authenticacion.store";

/**
 * Hook para centralizar la lógica de permisos del usuario.
 * Lee del authStore (que persiste en Local Storage) para garantizar consistencia.
 */
export const usePermisosDeUsuario = () => {
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

  // Extraemos todas las acciones (nombres de permisos)
  const accionesPermitidas = useMemo(() => {
    if (!usuario?.roles) return [];

    const acciones = new Set();
    usuario.roles.forEach((rol) => {
      if (rol.permisos && Array.isArray(rol.permisos)) {
        rol.permisos.forEach((p) => {
          if (p.nombre) {
            // p.acciones es un array de objetos: [{"nombre": "CREAR"}]
            if (p.acciones && Array.isArray(p.acciones)) {
              p.acciones.forEach((acc) => {
                if (acc && acc.nombre) {
                  const tieneRestriccion =
                    acc.permitidos &&
                    Array.isArray(acc.permitidos) &&
                    acc.permitidos.length > 0;

                  if (!tieneRestriccion) {
                    // Si no hay restricciones, es global
                    acciones.add(acc.nombre.toUpperCase());
                  } else {
                    // Si hay restricciones, verificamos si el usuario actual está en la lista
                    const estaPermitido = acc.permitidos.some(
                      (pAllowed) =>
                        pAllowed.codigoUsuario === usuario?.codigoSecuencial &&
                        pAllowed.codigoEmpresa === usuario?.codigoEmpresa &&
                        pAllowed.nombreUsuario ===
                          `${usuario.nombre} ${usuario.apellido}` &&
                        pAllowed.nombreEmpresa === usuario.nombreEmpresa,
                    );

                    if (estaPermitido) {
                      acciones.add(acc.nombre.toUpperCase());
                    }
                  }
                }
              });
            }
          }
        });
      }
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
    accionesPermitidas,
    tienePermiso,
    tieneAccion,
    usuario,
  };
};
