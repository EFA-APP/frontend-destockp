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

export const ObtenerContactoApi = async (codigoSecuencial) => {
  const { data } = await axiosInitial.get(
    `/contactos/listar/${codigoSecuencial}`,
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

export const ActualizarContactoApi = async (codigoSecuencial, dto) => {
  const { data } = await axiosInitial.patch(
    `/contactos/actualizar/${codigoSecuencial}`,
    dto,
  );
  return data;
};

export const EliminarContactoApi = async (codigoSecuencial) => {
  const { data } = await axiosInitial.delete(`/contactos/${codigoSecuencial}`);
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
  codigoSecuencial,
  dto,
) => {
  const { data } = await axiosInitial.patch(
    `/contactos/configuracion/${codigoSecuencial}`,
    dto,
  );
  return data;
};

export const EliminarConfiguracionCampoApi = async (codigoSecuencial) => {
  const { data } = await axiosInitial.delete(
    `/contactos/configuracion/${codigoSecuencial}`,
  );
  return data;
};
export const ActualizarSaldoApi = async (codigoSecuencial, dto) => {
  const { data } = await axiosInitial.patch(
    `/contactos/actualizar-saldo/${codigoSecuencial}`,
    dto,
  );
  return data;
};

export const ListarMovimientosApi = async (codigoSecuencial) => {
  const url = codigoSecuencial
    ? `/contactos/movimientos/${codigoSecuencial}`
    : `/contactos/movimientos`;

  const { data } = await axiosInitial.get(url, { showLoader: false });
  return data;
};

export const EmitirCuotasMasivasApi = async (dto) => {
  const { data } = await axiosInitial.post(
    `/contactos/emitir-cuotas-masivas`,
    dto,
  );
  return data;
};

export const CargarInteresMasivaApi = async (dto) => {
  const { data } = await axiosInitial.post(
    `/contactos/cargar-interes-masivo`,
    dto,
  );
  return data;
};
