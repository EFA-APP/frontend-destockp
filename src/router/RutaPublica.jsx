import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../Backend/Autenticacion/store/authenticacion.store";

const RutaPublica = () => {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/panel" replace />;
  }

  return <Outlet />;
};

export default RutaPublica;
