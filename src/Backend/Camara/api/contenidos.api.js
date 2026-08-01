import { axiosInitial } from "../../Config";

export const ListarContenidosApi = async (filtros = {}) => {
  const params = new URLSearchParams({ ...filtros }).toString();
  const { data } = await axiosInitial.get(`/admin/contenidos?${params}`, {
    showLoader: false,
  });
  return data;
};

export const CrearContenidoApi = async (dto) => {
  const { data } = await axiosInitial.post(`/admin/contenidos`, dto);
  return data;
};

export const ActualizarContenidoApi = async (id, dto) => {
  const { data } = await axiosInitial.put(`/admin/contenidos/${id}`, dto);
  return data;
};

export const EliminarContenidoApi = async (id) => {
  const { data } = await axiosInitial.delete(`/admin/contenidos/${id}`);
  return data;
};
