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

/**
 * Anulación general de Recibo/Orden de Pago (R75-R90, T44/T63):
 * `POST /comprobantes/:codigo/anular`, dispara la reversión contable
 * automática en el backend. `motivo` es obligatorio.
 */
export const anularComprobanteApi = async (codigo, motivo) => {
  const { data } = await axiosInitial.post(`/comprobantes/${codigo}/anular`, {
    motivo,
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

export const ObtenerDeudasContactoApi = async (codigoReceptor, codigoUnidadNegocio) => {
  const { data } = await axiosInitial.get(
    `/comprobantes/deudas/${codigoReceptor}`,
    { 
      params: { codigoUnidadNegocio },
      showLoader: false 
    },
  );
  return data;
};

export const ObtenerContactosConDeudaListApi = async (tipoOperacion, codigoEmpresa, codigoUnidadNegocio) => {
  const { data } = await axiosInitial.get(
    `/comprobantes/contactos-con-deuda`,
    { 
      params: { tipoOperacion, codigoEmpresa, codigoUnidadNegocio },
      showLoader: false 
    },
  );
  return data;
};
