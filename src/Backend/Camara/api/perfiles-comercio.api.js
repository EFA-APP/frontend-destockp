import { axiosInitial } from "../../Config";

export const ListarPerfilesComercioAdminApi = async (filtros) => {
  const { data } = await axiosInitial.get(`/comercio/profile/admin/lista`, {
    params: filtros,
    showLoader: false,
  });
  return data;
};

export const ObtenerPerfilesComerciosAdminApi = async () => {
  const { data } = await axiosInitial.get("/comercio/profile/admin/lista");
  return data;
};

export const PausarUsuariosComercioApi = async (idContacto) => {
  const { data } = await axiosInitial.patch(`/comercio/profile/admin/pausar-usuarios/${idContacto}`);
  return data;
};
