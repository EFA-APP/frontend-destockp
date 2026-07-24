import { axiosInitial } from '../Config';

export const cuentasCorrientesAPI = {
  listarCuentasCorrientes: async ({ tipo, pagina, limite, search }) => {
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    if (pagina) params.append('pagina', pagina);
    if (limite) params.append('limite', limite);
    if (search) params.append('search', search);

    const response = await axiosInitial.get(`/cuentas-corrientes?${params.toString()}`);
    return response.data;
  },

  listarComprobantesPorContacto: async (codigoContacto, { desde, hasta, estado }) => {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    if (estado && estado !== 'TODOS') params.append('estado', estado);

    const response = await axiosInitial.get(`/cuentas-corrientes/${codigoContacto}/comprobantes?${params.toString()}`);
    return response.data;
  },

  // Feature reporte-cuenta-corriente-pdf: el PDF del detalle de cuenta
  // corriente de un contacto se genera en el servidor (mismo patron que
  // `DescargarReporteStockPdfApi` en deposito.api.js). Devuelve el binario
  // del PDF (responseType: 'blob'), a diferencia de `listarComprobantesPorContacto`.
  descargarReportePdf: async (codigoContacto, { desde, hasta, estado, tipo }) => {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    if (estado && estado !== 'TODOS') params.append('estado', estado);
    if (tipo) params.append('tipo', tipo);

    const respuesta = await axiosInitial.get(
      `/cuentas-corrientes/${codigoContacto}/reporte/pdf?${params.toString()}`,
      { responseType: 'blob', showLoader: true },
    );
    return respuesta.data;
  },

  obtenerMetricas: async () => {
    const response = await axiosInitial.get(`/cuentas-corrientes/metricas`);
    return response.data;
  },

  descargarReporteMetricasPdf: async (metricasActivasObj) => {
    const activas = Object.keys(metricasActivasObj).filter((k) => metricasActivasObj[k]);
    const params = new URLSearchParams();
    if (activas.length > 0) {
      params.append('metricas', activas.join(','));
    } else {
      params.append('metricas', '');
    }

    const respuesta = await axiosInitial.get(
      `/cuentas-corrientes/metricas/reporte/pdf?${params.toString()}`,
      { responseType: 'blob', showLoader: true },
    );
    return respuesta.data;
  },
};
