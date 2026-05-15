import { axiosInitial } from "../../../Config";

export const obtenerComprobantesPaginados = async (filtros) => {
  const { data } = await axiosInitial.get("/comprobantes/obtener", {
    params: {
      ...filtros,
    },
    showLoader: false,
  });
  return data;
};

export const generarComprobante = async ({
  dto,
  codigoEmpresa,
  codigoUnidadNegocio,
}) => {
  const { data } = await axiosInitial.post(
    "/comprobantes/generar-comprobante",
    dto,
    {
      params: {
        codigoEmpresa,
        codigoUnidadNegocio,
      },
      showLoader: false,
    },
  );
  return data;
};
