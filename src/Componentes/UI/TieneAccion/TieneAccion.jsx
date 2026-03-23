import { usePermisosDeUsuario } from "../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";

export const TieneAccion = ({ accion, children }) => {
  const { tieneAccion } = usePermisosDeUsuario();

  if (!tieneAccion(accion)) {
    return null;
  }

  return <>{children}</>;
};
