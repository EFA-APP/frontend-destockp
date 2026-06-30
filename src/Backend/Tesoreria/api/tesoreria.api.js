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
  if (filtros.conciliado !== undefined && filtros.conciliado !== null)
    params.conciliado = filtros.conciliado;
  if (filtros.codigoTipoMovimiento) params.codigoTipoMovimiento = filtros.codigoTipoMovimiento;
  if (filtros.pagina) params.pagina = filtros.pagina;
  if (filtros.limite) params.limite = filtros.limite;

  const { data } = await axiosInitial.get("/tesoreria/movimientos", { params });
  return data;
};
