import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useCambiarContrasena } from "../../../Backend/Autenticacion/queries/Usuario/useCambiarContrasena.mutation";
import { useAlertas } from "../../../store/useAlertas";
import Boton from "../../UI/Boton/Boton";
import InputReutilizable from "../../UI/InputReutilizable/InputReutilizable";

/**
 * specs/habilitar-usuario-password-aleatoria-forzar-cambio/design.md §3.
 *
 * Modal bloqueante mostrado inmediatamente después de la redirección
 * post-login cuando `usuario.debeCambiarContrasena` es `true` (R17). Sin
 * botón de cierre ni cierre por click en el overlay (R18) — a diferencia de
 * ModalDetalleBase, este componente NO expone ningún `onClose`. Reutiliza
 * el hook `useCambiarContrasena` (mismo endpoint que Configuracion.jsx, ver
 * design.md §0) en vez de crear un endpoint/hook nuevo.
 */
const ModalForzarCambioContrasena = () => {
  const usuario = useAuthStore((state) => state.usuario);
  const setUsuario = useAuthStore((state) => state.setUsuario);
  const { mutate: cambiarContrasena, isPending } = useCambiarContrasena();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);

  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarNuevaContrasena, setConfirmarNuevaContrasena] =
    useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!contrasenaActual || !nuevaContrasena || !confirmarNuevaContrasena) {
      agregarAlerta({
        type: "warning",
        message: "Complete todos los campos.",
      });
      return;
    }

    if (nuevaContrasena !== confirmarNuevaContrasena) {
      agregarAlerta({
        type: "error",
        message: "Las nuevas contraseñas no coinciden.",
      });
      return;
    }

    cambiarContrasena(
      { contrasenaActual, nuevaContrasena },
      {
        // R19: al completarse exitosamente, se cierra el modal (deja de
        // renderizarse porque debeCambiarContrasena pasa a false en el
        // store) y se habilita la navegación normal del panel.
        onSuccess: () => {
          setUsuario({ ...usuario, debeCambiarContrasena: false });
          setContrasenaActual("");
          setNuevaContrasena("");
          setConfirmarNuevaContrasena("");
        },
      },
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-[420px] mx-4 bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.25)] border border-[var(--color-neutral-border)]">
        <div className="px-6 pt-8 pb-4 text-center border-b border-[var(--color-neutral-border)]">
          <h2 className="text-[18px] font-bold text-[var(--color-neutral-text-main)] tracking-tight">
            Cambio de contraseña requerido
          </h2>
          <p className="text-[13px] text-[var(--color-neutral-text-muted)] mt-2 leading-relaxed">
            Por seguridad, debés establecer una nueva contraseña antes de
            continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-3">
          <InputReutilizable
            label="Contraseña Actual"
            tipo="password"
            valor={contrasenaActual}
            onChange={(e) => setContrasenaActual(e.target.value)}
            required
          />
          <InputReutilizable
            label="Nueva Contraseña"
            tipo="password"
            valor={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            required
          />
          <InputReutilizable
            label="Confirmar Nueva Contraseña"
            tipo="password"
            valor={confirmarNuevaContrasena}
            onChange={(e) => setConfirmarNuevaContrasena(e.target.value)}
            required
          />

          <Boton
            texto={isPending ? "Cambiando..." : "Cambiar Contraseña"}
            tipo="submit"
            disabled={isPending}
            className="w-full mt-2"
          />
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ModalForzarCambioContrasena;
