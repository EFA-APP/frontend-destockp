import { Navigate } from "react-router-dom";
import { useAuthStore } from "../backend/authenticacion/store/authenticacion.store";

const RutaPublica = ({ children }) => {
  const usuario = useAuthStore((estado) => estado.usuario);
  if (usuario) {
    return <Navigate to="/panel" replace />;
  }

  return children;
};

export default RutaPublica;
