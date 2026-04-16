import { axiosInitial } from "../../../Config";


export const obtenerComprobantesPaginados = async (filtros) => {
  const { data } = await axiosInitial.get("/ventas/obtener", {
    params: {
      ...filtros,
    },
    showLoader: false,
  });
  return data;
};

export const generarComprobante = async ({ dto, codigoEmpresa, codigoUnidadNegocio }) => {
  const { data } = await axiosInitial.post("/ventas/generar-comprobante", dto, {
    params: {
        codigoEmpresa,
        codigoUnidadNegocio
    },
    showLoader: false,
  });
  return data;
};
