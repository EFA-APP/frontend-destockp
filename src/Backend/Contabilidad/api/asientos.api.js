import { axiosInitial } from "../../Config";

export const listarAsientos = async ({ codigoEmpresa, origenModulo, fechaDesde, fechaHasta } = {}) => {
  const params = { codigoEmpresa };
  if (origenModulo && origenModulo !== "TODOS") params.origenModulo = origenModulo;
  if (fechaDesde) params.fechaDesde = fechaDesde;
  if (fechaHasta) params.fechaHasta = fechaHasta;

  const { data } = await axiosInitial.get("/contabilidad/asientos", { params });
  return data;
};

export const crearAsiento = async (dto) => {
  const { data } = await axiosInitial.post("/contabilidad/asientos", dto);
  return data;
};
