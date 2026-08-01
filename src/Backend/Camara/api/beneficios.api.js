import { axiosInitial } from "../../Config";

export const ListarBeneficiosAdminApi = async (filtros) => {
  const { data } = await axiosInitial.get(`/admin/beneficios`, {
    params: filtros,
    showLoader: false,
  });
  return data;
};

export const CrearBeneficioAdminApi = async (dto) => {
  const { data } = await axiosInitial.post(`/admin/beneficios`, dto);
  return data;
};

export const AprobarBeneficioApi = async (id) => {
  const { data } = await axiosInitial.patch(`/admin/beneficios/${id}/aprobar`);
  return data;
};

export const PausarBeneficioAdminApi = async (id) => {
  const { data } = await axiosInitial.patch(`/admin/beneficios/${id}/pausar`);
  return data;
};

export const ReanudarBeneficioAdminApi = async (id) => {
  const { data } = await axiosInitial.patch(`/admin/beneficios/${id}/reanudar`);
  return data;
};

export const RechazarBeneficioApi = async ({ id, dto }) => {
  const { data } = await axiosInitial.patch(`/admin/beneficios/${id}/rechazar`, dto);
  return data;
};
