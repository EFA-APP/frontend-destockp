import { axiosInitial } from "../../../Config";

export const iniciarSesionApi = async ({ email, contrasena }) => {
  const respuesta = await axiosInitial.post(
    "/auth/iniciarsesion",
    { // El cuerpo de la solicitud
      correoElectronico: email,
      contrasena: contrasena,
    },
    {
      
      showLoader: false, // Configuración donde activas el loader
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

export const obtenerUsuariosPorEmpresaApi = async (codigoEmpresa) => {
  const respuesta = await axiosInitial.get("/auth/usuarios", {
    params: { codigoEmpresa },
    showLoader: false,
  });
  return respuesta.data;
};

export const asignarRolApi = async ({ codigoEmpresa, codigoUsuario, codigoRol }) => {
  const respuesta = await axiosInitial.post(
    "/auth/asignarRol", 
    { codigoUsuario, codigoRol }, // BODY explícito
    { params: { codigoEmpresa }, showLoader: false } // PARAMS explícitos
  );
  return respuesta.data;
};

export const removerRolApi = async ({ codigoEmpresa, codigoUsuario, codigoRol }) => {
  const respuesta = await axiosInitial.post(
    "/auth/removerRol", 
    { codigoUsuario, codigoRol }, // BODY explícito
    { params: { codigoEmpresa }, showLoader: false } // PARAMS explícitos
  );
  return respuesta.data;
};

export const registrarseApi = async ({ codigoEmpresa, ...data }) => {
  const respuesta = await axiosInitial.post("/auth/registrarse", data, { 
    params: { codigoEmpresa },
    showLoader: false 
  });
  return respuesta.data;
};

export const actualizarEstadoUsuarioApi = async ({ codigo, activo, codigoEmpresa }) => {
  const respuesta = await axiosInitial.patch(
    `/auth/usuarios/${codigo}/estado`, 
    { activo }, 
    { params: { codigoEmpresa }, showLoader: false }
  );
  return respuesta.data;
};

export const eliminarUsuarioApi = async (codigo) => {
  const respuesta = await axiosInitial.delete(`/auth/usuarios/${codigo}`);
  return respuesta.data;
};

export const actualizarUsuarioApi = async ({ codigo, codigoEmpresa, ...datos }) => {
  const respuesta = await axiosInitial.patch(
    `/auth/usuarios/${codigo}`, 
    datos, 
    { params: { codigoEmpresa }, showLoader: false }
  );
  return respuesta.data;
};

export const actualizarPerfilApi = async (data) => {
  const respuesta = await axiosInitial.patch("/auth/perfil", data, { showLoader: true });
  return respuesta.data;
};

export const cambiarContrasenaApi = async (data) => {
  const respuesta = await axiosInitial.post("/auth/perfil/cambiar-contrasena", data, { showLoader: true });
  return respuesta.data;
};

export const actualizarPreferenciasTablaApi = async (data) => {
  const respuesta = await axiosInitial.patch("/auth/empresa/preferencias-tabla", data, { showLoader: false });
  return respuesta.data;
};

export const actualizarConfiguracionVisualApi = async (data) => {
  const respuesta = await axiosInitial.patch("/auth/empresa/configuracionVisual", data, { showLoader: true });
  return respuesta.data;
};

export const seleccionarUnidadApi = async (data) => {
  const respuesta = await axiosInitial.post("/unidadesNegocio/seleccionarUnidad", data, { showLoader: true });
  return respuesta.data;
};
