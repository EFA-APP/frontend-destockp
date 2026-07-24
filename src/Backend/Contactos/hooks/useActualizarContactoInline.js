import { useContactos } from "./useContactos";
import { useAlertas } from "../../../store/useAlertas";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Feature 35 (contactos-tabs-usuarios-relaciones-globales, R14). Extraído
// de ListaContactos.jsx (antes función local `handleActualizarContactoInline`,
// no exportada) para que ListaUsuariosContactos.jsx pueda reutilizar la
// misma validación de email (R10, R11) + invocación de
// `PATCH /contactos/actualizar/:codigo` (R12) + feedback de alertas, sin
// duplicar esa lógica en dos archivos.
export const useActualizarContactoInline = () => {
  const { actualizarContacto } = useContactos();
  const { agregarAlerta } = useAlertas();

  const actualizarContactoInline = async (codigo, payloadActualizado) => {
    if (payloadActualizado.correoElectronico) {
      if (!EMAIL_REGEX.test(payloadActualizado.correoElectronico.trim())) {
        agregarAlerta({
          title: "Correo Inválido",
          message:
            "El correo electrónico ingresado no tiene un formato válido.",
          type: "warning",
        });
        return false; // R11: no invoca la actualización
      }
    }

    try {
      // payloadActualizado ya es el delta exacto que arma cada componente
      // inline (InlineEnteFacturacion/InlineIdentidad/InlineAtributo/
      // InlineEmailUsuario) — no hace falta ninguna blacklist de campos.
      await actualizarContacto({ id: codigo, dto: payloadActualizado }); // R12
      agregarAlerta({
        title: "Actualizado",
        message: "Contacto actualizado correctamente.",
        type: "success",
      });
      return true;
    } catch (error) {
      console.error("Error al actualizar contacto en línea:", error);
      agregarAlerta({
        title: "Error",
        message: "No se pudo actualizar el contacto.",
        type: "error",
      });
      return false;
    }
  };

  return { actualizarContactoInline };
};
