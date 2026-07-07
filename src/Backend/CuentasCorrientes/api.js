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
};
