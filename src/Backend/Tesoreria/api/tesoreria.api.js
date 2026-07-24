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

// Ronda 7 (feature cheques-terceros-tesoreria): catálogo de bancos BCRA
// (`model Banco` en tesoreria-ms, 73 filas), usado para reemplazar el
// input de texto libre "Banco" al cargar un cheque de tercero.
export const listarBancos = async (busqueda = "") => {
  const params = {};
  if (busqueda) params.busqueda = busqueda;

  const { data } = await axiosInitial.get("/tesoreria/bancos", {
    params,
    showLoader: false,
  });
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

// ──────────────────────────────────────────────────────────────
// Feature "bancos" (T46, R71, R72): CuentaBancaria, MovimientoBancario,
// Transferencia, Deposito, Conciliación. Mismo patrón que las funciones de
// arriba (params limpiados a mano, sin librería de querystring adicional).
// ──────────────────────────────────────────────────────────────

export const listarCuentasBancarias = async ({ codigoEmpresa, codigoUnidadNegocio, activa } = {}) => {
  const params = { codigoEmpresa };
  if (codigoUnidadNegocio) params.codigoUnidadNegocio = codigoUnidadNegocio;
  if (activa !== undefined && activa !== null) params.activa = activa;

  const { data } = await axiosInitial.get("/tesoreria/bancos/cuentas", { params });
  return data;
};

export const obtenerCuentaBancaria = async (codigo, codigoEmpresa) => {
  const { data } = await axiosInitial.get(`/tesoreria/bancos/cuentas/${codigo}`, {
    params: { codigoEmpresa },
  });
  return data;
};

export const crearCuentaBancaria = async (payload, { codigoEmpresa, codigoUnidadNegocio }) => {
  const { data } = await axiosInitial.post("/tesoreria/bancos/cuentas", payload, {
    params: { codigoEmpresa, codigoUnidadNegocio },
  });
  return data;
};

export const editarCuentaBancaria = async (codigo, payload, { codigoEmpresa }) => {
  const { data } = await axiosInitial.put(`/tesoreria/bancos/cuentas/${codigo}`, payload, {
    params: { codigoEmpresa },
  });
  return data;
};

export const listarMovimientosBancarios = async (codigoCuenta, filtros = {}) => {
  const params = {};
  if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
  if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
  if (filtros.codigoTipoMovimiento) params.codigoTipoMovimiento = filtros.codigoTipoMovimiento;
  if (filtros.estadoConciliacion) params.estadoConciliacion = filtros.estadoConciliacion;
  if (filtros.pagina) params.pagina = filtros.pagina;
  if (filtros.limite) params.limite = filtros.limite;

  const { data } = await axiosInitial.get(`/tesoreria/bancos/cuentas/${codigoCuenta}/movimientos`, { params });
  return data;
};

export const crearMovimientoBancarioAjuste = async (payload, { codigoEmpresa, codigoUnidadNegocio }) => {
  const { data } = await axiosInitial.post("/tesoreria/bancos/movimientos/ajuste", payload, {
    params: { codigoEmpresa, codigoUnidadNegocio },
  });
  return data;
};

export const crearTransferencia = async (payload, { codigoEmpresa, codigoUnidadNegocio }) => {
  const { data } = await axiosInitial.post("/tesoreria/bancos/movimientos/transferencia", payload, {
    params: { codigoEmpresa, codigoUnidadNegocio },
  });
  return data;
};

export const crearDeposito = async (payload, { codigoEmpresa, codigoUnidadNegocio }) => {
  const { data } = await axiosInitial.post("/tesoreria/bancos/movimientos/deposito", payload, {
    params: { codigoEmpresa, codigoUnidadNegocio },
  });
  return data;
};

export const obtenerDeposito = async (codigo, codigoEmpresa) => {
  const { data } = await axiosInitial.get(`/tesoreria/bancos/depositos/${codigo}`, {
    params: { codigoEmpresa },
  });
  return data;
};

export const conciliarMovimientosManual = async (codigoCuenta, payload, { codigoEmpresa }) => {
  const { data } = await axiosInitial.post(
    `/tesoreria/bancos/cuentas/${codigoCuenta}/conciliar-manual`,
    payload,
    { params: { codigoEmpresa } },
  );
  return data;
};

export const marcarDiferenciaMovimiento = async (codigoCuenta, payload, { codigoEmpresa }) => {
  const { data } = await axiosInitial.post(
    `/tesoreria/bancos/cuentas/${codigoCuenta}/marcar-diferencia`,
    payload,
    { params: { codigoEmpresa } },
  );
  return data;
};

export const desconciliarMovimiento = async (codigoCuenta, payload, { codigoEmpresa }) => {
  const { data } = await axiosInitial.post(
    `/tesoreria/bancos/cuentas/${codigoCuenta}/desconciliar`,
    payload,
    { params: { codigoEmpresa } },
  );
  return data;
};

// R41: el archivo se envía en base64 dentro del body JSON (mismo patrón
// que la importación de Obras Sociales — ver progress/impl_bancos.md), no
// multipart/form-data.
export const conciliarExtractoExcel = async (codigoCuenta, payload, { codigoEmpresa }) => {
  const { data } = await axiosInitial.post(
    `/tesoreria/bancos/cuentas/${codigoCuenta}/conciliar-excel`,
    payload,
    { params: { codigoEmpresa } },
  );
  return data;
};
