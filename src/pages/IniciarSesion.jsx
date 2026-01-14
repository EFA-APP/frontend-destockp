import { useNavigate } from "react-router-dom";
import FormularioAuth from "../Componentes/UI/FormularioAuth/FormularioAuth";

const IniciarSesion = () => {
  const navigate = useNavigate(); 

  const handleSubmit = () => {
      navigate("panel")
  }

  return (
    <FormularioAuth
      titulo="Inciar Sesión"
      descripcion="Accedé al sistema de gestión"
      campos={[
        {
          name: "email",
          label: "Email",
          type: "text",
          placeholder: "ejemplo@gmail.com",
          enlace: {
            to: "/recuperar-email",
            texto: "¿Olvidaste tu email?"
          }
        },
        {
          name: "contrasena",
          label: "Contraseña",
          type: "text",
          placeholder: "**********",
          enlace: {
            to: "/recuperar-contrasena",
            texto: "¿Olvidaste tu contraseña?"
          }
        },
      ]}
      onSubmit={handleSubmit}
      // cargando={cargando}
      // errores={errores}
      boton={{
        texto: "Iniciar Sesión",
        textoCargando: "Iniciando...",
      }}
      // pieFormulario={{
      //   pregunta: "¿?",
      //   enlace: {
      //     texto: "Iniciar",
      //     to: "/iniciar-sesion",
      //   },
      // }}
    />
  );
};

export default IniciarSesion;
