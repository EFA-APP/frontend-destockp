import { axiosInitial } from "../../../Config";

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

export const obtenerUsuariosApi = async () => {
  const respuesta = await axiosInitial.get("/auth/usuarios", { showLoader: false });
  return respuesta.data;
};

export const asignarRolApi = async (data) => {
  const respuesta = await axiosInitial.post("/auth/asignarRol", data, { showLoader: false });
  return respuesta.data;
};

export const registrarseApi = async (data) => {
  const respuesta = await axiosInitial.post("/auth/registrarse", data, { showLoader: false });
  return respuesta.data;
};

export const actualizarEstadoUsuarioApi = async ({ codigoSecuencial, activo }) => {
  const respuesta = await axiosInitial.patch(`/auth/usuarios/${codigoSecuencial}/estado`, { activo }, { showLoader: false });
  return respuesta.data;
};

export const eliminarUsuarioApi = async (codigoSecuencial) => {
  const respuesta = await axiosInitial.delete(`/auth/usuarios/${codigoSecuencial}`);
  return respuesta.data;
};



