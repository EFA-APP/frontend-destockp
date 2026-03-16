import { useNavigate } from "react-router-dom";
import FormularioAuth from "../Componentes/UI/FormularioAuth/FormularioAuth";
import { useIniciarSesion } from "../Backend/Autenticacion/queries/Usuario/useIniciarSesion.query";
import { useAlertas } from "../store/useAlertas";

const IniciarSesion = () => {
  const navigate = useNavigate();
  const { mutate: iniciarSesion, isPending, error } = useIniciarSesion();
  const { agregarAlerta } = useAlertas();

  const handleSubmit = (valores) => {
    iniciarSesion(
      { email: valores.email, contrasena: valores.contrasena },
      {
        onSuccess: () => {
          agregarAlerta({
            type: "exito",
            message: "Sesión iniciada correctamente",
          });
          navigate("/panel");
        },
        onError: (err) => {
          agregarAlerta({
            type: "error",
            message: err?.response?.data?.message || "Correo o contraseña incorrectos",
          });
        },
      }
    );
  };

  return (
    <FormularioAuth
      titulo="Iniciar Sesión"
      descripcion="Accedé al sistema de gestión"
      campos={[
        {
          name: "email",
          label: "Email",
          type: "text",
          placeholder: "ejemplo@gmail.com"
        },
        {
          name: "contrasena",
          label: "Contraseña",
          type: "password",
          placeholder: "**********",
          enlace: {
            to: "/recuperar-contrasena",
            texto: "¿Olvidaste tu contraseña?",
          },
        },
      ]}
      onSubmit={handleSubmit}
      cargando={isPending}
      errores={error ? { contrasena: "Credenciales inválidas" } : {}}
      boton={{
        texto: "Iniciar Sesión",
        textoCargando: "Iniciando...",
      }}
    />
  );
};

export default IniciarSesion;
