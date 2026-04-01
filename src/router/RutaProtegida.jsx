import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../Backend/Autenticacion/store/authenticacion.store";
import { usePermisosDeUsuario } from "../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";

const RutaProtegida = ({ permisoRequerido }) => {
  const { token } = useAuthStore();
  const { tienePermiso } = usePermisosDeUsuario();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (permisoRequerido && !tienePermiso(permisoRequerido)) {
    return <Navigate to="/panel" replace />;
  }

  return <Outlet />;
};

export default RutaProtegida;
