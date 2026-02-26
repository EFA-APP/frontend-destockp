import { axiosInitial } from "../../../config";

export const iniciarSesionApi = async ({ email, contrasena }) => {
  const respuesta = await axiosInitial.post(
    "/auth/iniciarsesion",
    { // El cuerpo de la solicitud
      correoElectronico: email,
      contrasena: contrasena,
    },
    {
      showLoader: true, // Configuración donde activas el loader
    }
  );

  return respuesta.data;
}

export const verificarTokenApi = async () => {
  const respuesta = await axiosInitial.get(
    "/auth/verificarToken",
    { // Configuración de la solicitud
      showLoader: false,
    }
  );
  return respuesta.data; 
}
