import { axiosInitial } from "../../Config";

export const listarLotesTarjeta = async (filtros = {}) => {
  const params = {};
  if (filtros.codigoEmpresa) params.codigoEmpresa = filtros.codigoEmpresa;
  if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
  if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
  if (filtros.tipo) params.tipo = filtros.tipo;

  const { data } = await axiosInitial.get("/tesoreria/lotes-tarjeta", { params });
  return data;
};

export const listarMovimientosFinanciero = async (filtros = {}) => {
  const params = {};
  if (filtros.codigoEmpresa) params.codigoEmpresa = filtros.codigoEmpresa;
  if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
  if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
  if (filtros.tipoOperacion) params.tipoOperacion = filtros.tipoOperacion;
  if (filtros.codigoBancoDestino) params.codigoBancoDestino = filtros.codigoBancoDestino;
  if (filtros.codigoUnidadNegocio) params.codigoUnidadNegocio = filtros.codigoUnidadNegocio;
  if (filtros.conciliado !== undefined && filtros.conciliado !== null)
    params.conciliado = filtros.conciliado;
  if (filtros.codigoTipoMovimiento) params.codigoTipoMovimiento = filtros.codigoTipoMovimiento;
  if (filtros.pagina) params.pagina = filtros.pagina;
  if (filtros.limite) params.limite = filtros.limite;

  const { data } = await axiosInitial.get("/tesoreria/movimientos", { params });
  return data;
};

export const listarChequesTercero = async (filtros = {}) => {
  const params = {};
  if (filtros.codigoEmpresa) params.codigoEmpresa = filtros.codigoEmpresa;
  if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
  if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
  if (filtros.codigoTipoMovimiento) params.codigoTipoMovimiento = filtros.codigoTipoMovimiento;

  const { data } = await axiosInitial.get("/tesoreria/cheques-tercero", { params });
  return data;
};

export const crearMovimientoManual = async (
  payload,
  { codigoEmpresa, codigoUnidadNegocio },
) => {
  const { data } = await axiosInitial.post(
    "/tesoreria/movimientos-manuales",
    payload,
    { params: { codigoEmpresa, codigoUnidadNegocio } },
  );
  return data;
};

export const obtenerCajaDiariaAbierta = async ({ codigoEmpresa, codigoUnidadNegocio }) => {
  const params = { codigoEmpresa };
  if (codigoUnidadNegocio) params.codigoUnidadNegocio = codigoUnidadNegocio;
  const { data } = await axiosInitial.get("/tesoreria/caja-diaria/abierta", { params });
  return data;
};

export const abrirCajaDiaria = async (payload, { codigoEmpresa, codigoUnidadNegocio }) => {
  const params = { codigoEmpresa };
  if (codigoUnidadNegocio) params.codigoUnidadNegocio = codigoUnidadNegocio;
  const { data } = await axiosInitial.post("/tesoreria/caja-diaria/abrir", payload, { params });
  return data;
};

export const cerrarCajaDiaria = async (payload, { codigoEmpresa, codigoUnidadNegocio }) => {
  const params = { codigoEmpresa };
  if (codigoUnidadNegocio) params.codigoUnidadNegocio = codigoUnidadNegocio;
  const { data } = await axiosInitial.post("/tesoreria/caja-diaria/cerrar", payload, { params });
  return data;
};

export const listarCajaDiariaHistorial = async (filtros = {}) => {
  const params = {};
  if (filtros.codigoEmpresa) params.codigoEmpresa = filtros.codigoEmpresa;
  if (filtros.codigoUnidadNegocio) params.codigoUnidadNegocio = filtros.codigoUnidadNegocio;
  if (filtros.pagina) params.pagina = filtros.pagina;
  if (filtros.limite) params.limite = filtros.limite;

  const { data } = await axiosInitial.get("/tesoreria/caja-diaria/historial", { params });
  return data;
};
