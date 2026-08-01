import ContenidoPanel from "../Componentes/ContenidoPanel/ContenidoPanel";
import BarraLateral from "../Componentes/UI/BarraLateral/BarraLateral";
import NavbarMovil from "../Componentes/UI/BarraLateral/NavbarMovil";
import ModalForzarCambioContrasena from "../Componentes/Modales/Auth/ModalForzarCambioContrasena";
import { useAuthStore } from "../Backend/Autenticacion/store/authenticacion.store";

const Panel = () => {
  const usuario = useAuthStore((state) => state.usuario);

  return (
    <div className="w-full min-h-screen">
      <div className="flex w-full pb-2 md:pb-0">
        <BarraLateral />
        <NavbarMovil />
        <ContenidoPanel />
      </div>
      {/* R17, R18: modal bloqueante inmediatamente tras la redirección
          post-login (y también al recargar el panel con una sesión
          persistida cuyo flag siga en true), ver
          specs/habilitar-usuario-password-aleatoria-forzar-cambio/design.md §3. */}
      {usuario?.debeCambiarContrasena && <ModalForzarCambioContrasena />}
    </div>
  );
};

export default Panel;
