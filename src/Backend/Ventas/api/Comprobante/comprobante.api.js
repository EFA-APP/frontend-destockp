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

export const obtenerComprobantePorCodigo = async (codigo) => {
  const { data } = await axiosInitial.get(`/comprobantes/obtener/${codigo}`, {
    showLoader: false,
  });
  return data;
};

export const generarComprobante = async ({ dto, codigoUnidadNegocio }) => {
  const { data } = await axiosInitial.post(
    "/comprobantes/generar-comprobante",
    dto,
    {
      params: { codigoUnidadNegocio },
      showLoader: false,
    },
  );
  return data;
};

export const enviarComprobanteEmailApi = async ({
  emailDestino,
  pdfBase64,
  nombreComprobante,
  numeroComprobante,
  codigoUnidadNegocio,
}) => {
  const { data } = await axiosInitial.post(
    "/comprobantes/enviar-email",
    { emailDestino, pdfBase64, nombreComprobante, numeroComprobante },
    {
      params: { codigoUnidadNegocio },
      showLoader: false,
    },
  );
  return data;
};

export const ObtenerDeudasContactoApi = async (codigoReceptor) => {
  const { data } = await axiosInitial.get(
    `/comprobantes/deudas/${codigoReceptor}`,
    { showLoader: false },
  );
  return data;
};
