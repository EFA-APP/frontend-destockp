import { axiosInitial } from "../../Config";

export const ListarBannersApi = async () => {
  const { data } = await axiosInitial.get(`/admin/banners`, {
    showLoader: false,
  });
  return data;
};

export const CrearBannerApi = async (dto) => {
  const { data } = await axiosInitial.post(`/admin/banners`, dto);
  return data;
};

export const ActualizarBannerApi = async (id, dto) => {
  const { data } = await axiosInitial.put(`/admin/banners/${id}`, dto);
  return data;
};

export const EliminarBannerApi = async (id) => {
  const { data } = await axiosInitial.delete(`/admin/banners/${id}`);
  return data;
};
