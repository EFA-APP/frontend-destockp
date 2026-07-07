import { axiosInitial } from "../Config";

export const guardarConfiguracionSmtp = async (datos) => {
  const response = await axiosInitial.post("/correos/configuracion-smtp", datos);
  return response.data;
};

export const probarConfiguracionSmtp = async (datos) => {
  const response = await axiosInitial.post(
    "/correos/probar-configuracion-smtp",
    datos,
  );
  return response.data;
};

export const obtenerHistorialCorreos = async (filtros) => {
  const params = new URLSearchParams(filtros).toString();
  const response = await axiosInitial.get(`/correos/historial?${params}`);
  return response.data;
};
