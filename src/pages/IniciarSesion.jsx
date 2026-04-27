import { useNavigate } from "react-router-dom";
import FormularioAuth from "../Componentes/UI/FormularioAuth/FormularioAuth";
import { useIniciarSesion } from "../Backend/Autenticacion/queries/Usuario/useIniciarSesion.query";

const IniciarSesion = () => {
  const navigate = useNavigate();
  const { mutate: iniciarSesion, isPending, error } = useIniciarSesion();

  const handleSubmit = (valores) => {
    iniciarSesion(
      { email: valores.email, contrasena: valores.contrasena },
      {
        onSuccess: () => {
          navigate("/panel");
        },
      },
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
          placeholder: "ejemplo@gmail.com",
        },
        {
          name: "contrasena",
          label: "Contraseña",
          type: "password",
          placeholder: "**********",
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
