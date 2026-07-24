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
  const { data } = await axiosInitial.get(`/contactos/listar/${codigo}`, {
    showLoader: false,
  });
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
 * Habilitación masiva de usuarios (Feature 34,
 * contactos-habilitar-usuario-masivo). El flujo individual de UI (feature 20)
 * fue retirado en la feature 35 (contactos-tabs-usuarios-relaciones-globales,
 * R4): `HabilitarUsuarioContactoApi` se eliminó de este archivo, pero el
 * endpoint backend `POST /contactos/:codigo/habilitar-usuario` sigue
 * disponible sin cambios (R3) para cualquier consumidor futuro.
 */
export const HabilitarUsuarioMasivoContactoApi = async (dto) => {
  const { data } = await axiosInitial.post(
    `/contactos/habilitar-usuario-masivo`,
    dto,
  );
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

export const ActualizarConfiguracionCampoApi = async (codigo, dto) => {
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

/**
 * API para Configuración de Relaciones dinámicas entre Contactos
 * (Feature 33, contactos-relaciones-ui — consume los endpoints ya
 * expuestos por client-gateway en la feature 32).
 */
export const ListarConfiguracionRelacionesApi = async () => {
  const { data } = await axiosInitial.get(`/contactos/relacion-config`, {
    showLoader: false,
  });
  return data;
};

export const CrearConfiguracionRelacionApi = async (dto) => {
  const { data } = await axiosInitial.post(`/contactos/relacion-config`, dto);
  return data;
};

export const ActualizarConfiguracionRelacionApi = async (codigo, dto) => {
  const { data } = await axiosInitial.patch(
    `/contactos/relacion-config/${codigo}`,
    dto,
  );
  return data;
};

export const EliminarConfiguracionRelacionApi = async (codigo) => {
  const { data } = await axiosInitial.delete(
    `/contactos/relacion-config/${codigo}`,
  );
  return data;
};

/**
 * API para Relaciones dinámicas de un Contacto específico (Feature 33,
 * consume los endpoints ya expuestos por client-gateway en la feature 32).
 */
export const ListarVinculadosRelacionApi = async (
  codigo,
  idRelacion,
  params = {},
) => {
  const query = new URLSearchParams(params).toString();
  const { data } = await axiosInitial.get(
    `/contactos/${codigo}/relaciones/${idRelacion}?${query}`,
    { showLoader: false },
  );
  return data;
};

export const CrearRelacionContactoApi = async (codigo, idRelacion, dto) => {
  const { data } = await axiosInitial.post(
    `/contactos/${codigo}/relaciones/${idRelacion}`,
    dto,
  );
  return data;
};

export const DesvincularRelacionApi = async (
  codigo,
  idRelacion,
  codigoContactoRelacionado,
) => {
  const { data } = await axiosInitial.delete(
    `/contactos/${codigo}/relaciones/${idRelacion}/${codigoContactoRelacionado}`,
  );
  return data;
};
