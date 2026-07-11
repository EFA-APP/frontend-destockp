import { axiosInitial } from "../../Config";

/**
 * API para Gestión de Entidades (Tipos de contacto como Alumnos, Proveedores)
 */
export const ListarEntidadesApi = async () => {
  const { data } = await axiosInitial.get(`/contactos/entidad`, {
    showLoader: false,
  });
  return data;
};

export const CrearEntidadApi = async (dto) => {
  const { data } = await axiosInitial.post(`/contactos/entidad`, dto);
  return data;
};

export const EliminarEntidadApi = async (clave) => {
  const { data } = await axiosInitial.delete(`/contactos/entidad/${clave}`);
  return data;
};

/**
 * API para Gestión de Contactos
 */
export const ListarContactosApi = async (filtros = {}) => {
  const params = new URLSearchParams({ ...filtros }).toString();
  const { data } = await axiosInitial.get(`/contactos/listar?${params}`, {
    showLoader: false,
  });
  return data;
};

export const ObtenerContactoApi = async (codigo) => {
  console.log(codigo);
  const { data } = await axiosInitial.get(
    `/contactos/listar/${codigo}`,
    {
      showLoader: false,
    },
  );
  return data;
};

export const CrearContactoApi = async (dto) => {
  const { data } = await axiosInitial.post(`/contactos/crear`, dto);
  return data;
};

export const ActualizarContactoApi = async (codigo, dto) => {
  const { data } = await axiosInitial.patch(
    `/contactos/actualizar/${codigo}`,
    dto,
  );
  return data;
};

export const EliminarContactoApi = async (codigo) => {
  const { data } = await axiosInitial.delete(`/contactos/${codigo}`);
  return data;
};

export const ImportarContactosApi = async (dto) => {
  const { data } = await axiosInitial.post(`/contactos/importar`, dto);
  return data;
};

/**
 * API para Configuración de Campos Dinámicos
 */
export const ListarConfiguracionCamposApi = async () => {
  const { data } = await axiosInitial.get(`/contactos/configuracion`, {
    showLoader: false,
  });
  return data;
};

export const CrearConfiguracionCampoApi = async (dto) => {
  const { data } = await axiosInitial.post(`/contactos/configuracion`, dto);
  return data;
};

export const ActualizarConfiguracionCampoApi = async (
  codigo,
  dto,
) => {
  const { data } = await axiosInitial.patch(
    `/contactos/configuracion/${codigo}`,
    dto,
  );
  return data;
};

export const EliminarConfiguracionCampoApi = async (codigo) => {
  const { data } = await axiosInitial.delete(
    `/contactos/configuracion/${codigo}`,
  );
  return data;
};
