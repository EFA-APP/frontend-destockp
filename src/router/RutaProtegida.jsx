import { Navigate } from "react-router-dom";
import { useAuthStore } from "../Backend/hooks/Autenticacion/store/authenticacion.store";

const RutaProtegida = ({ children, rolesPermitidos }) => {
  const { usuario, token } = useAuthStore();

  // 🔐 No hay sesión
  if (!token || !usuario) {
    return <Navigate to="/" replace />;
  }

  // 🧑‍💼 Validación de roles
  if (rolesPermitidos?.length > 0) {
    const tienePermisos = rolesPermitidos.some((rol) =>
      usuario.roles?.includes(rol)
    );

    if (!tienePermisos) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default RutaProtegida;
