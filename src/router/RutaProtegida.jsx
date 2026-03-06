import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../Backend/Autenticacion/store/authenticacion.store";
import { useUserPermissions } from "../Backend/Autenticacion/hooks/useUserPermissions";

const RutaProtegida = ({ permisoRequerido }) => {
  const token = useAuthStore((state) => state.token);
  const { tienePermiso } = useUserPermissions();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (!tienePermiso(permisoRequerido)) {
    // Si está logueado pero no tiene permiso, redirigir al panel principal
    return <Navigate to="/panel" replace />;
  }

  return <Outlet />;
};

export default RutaProtegida;
