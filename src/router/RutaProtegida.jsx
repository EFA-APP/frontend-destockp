import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../Backend/Autenticacion/store/authenticacion.store";
import { usePermisosDeUsuario } from "../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";
import { useSeccionesUI } from "../Backend/Autenticacion/hooks/Secciones/useSeccionesUI";
import { useMemo } from "react";

const RutaProtegida = ({ permisoRequerido }) => {
  const { token } = useAuthStore();
  const { tienePermiso, codigosSeccionPermitidos } = usePermisosDeUsuario();
  const { secciones, cargandoSecciones } = useSeccionesUI();
  const location = useLocation();

  // 1. Verificación básica de sesión
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2. Si pasaron un permiso explícito, usamos la validación tradicional
  if (permisoRequerido) {
    if (!tienePermiso(permisoRequerido)) {
      return <Navigate to="/panel" replace />;
    }
    return <Outlet />;
  }

  // 3. Validación dinámica basada en la ruta actual y el menú
  const currentPath = location.pathname;

  if (currentPath === "/panel") {
    // El dashboard principal siempre es accesible
    return <Outlet />;
  }

  if (cargandoSecciones) {
    // Evitar falsos bloqueos mientras cargan las secciones del menú
    return <Outlet />;
  }

  // Si no hay secciones aún, dejamos pasar temporalmente o bloqueamos (mejor dejar pasar para evitar parpadeos si se está hidratando)
  if (!secciones || secciones.length === 0) {
    return <Outlet />;
  }

  // Recopilar todas las rutas permitidas para este usuario (incluyendo sus rutas base)
  const rutasPermitidas = new Set();

  const addRutaYBase = (ruta) => {
    if (!ruta || typeof ruta !== "string" || ruta.trim() === "") return;
    
    const cleanRuta = ruta.trim().toLowerCase();
    rutasPermitidas.add(cleanRuta);

    // Extraer la ruta base del módulo (ej. "/panel/inventario/productos" -> "/panel/inventario")
    const parts = cleanRuta.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] === "panel") {
      const baseRoute = `/${parts[0]}/${parts[1]}`;
      rutasPermitidas.add(baseRoute);
    }
  };

  secciones.forEach((seccion) => {
    // Solo procesamos las secciones a las que el usuario tiene acceso
    if (codigosSeccionPermitidos.includes(seccion.permisoRequerido)) {
      addRutaYBase(seccion.redireccion);
      
      if (seccion.subMenus) {
        seccion.subMenus.forEach((sm) => {
          addRutaYBase(sm.redireccion);
        });
      }
    }
  });

  // Verificar si la ruta actual coincide o empieza con alguna de las rutas base permitidas
  const lowerPath = currentPath.toLowerCase();
  const tieneAcceso = Array.from(rutasPermitidas).some(
    (ruta) => lowerPath === ruta || lowerPath.startsWith(`${ruta}/`)
  );

  if (!tieneAcceso) {
    // Si la ruta no está en su lista de rutas permitidas, lo pateamos al panel
    return <Navigate to="/panel" replace />;
  }

  return <Outlet />;
};

export default RutaProtegida;
