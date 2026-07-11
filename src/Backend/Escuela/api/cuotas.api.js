import { axiosInitial as axios } from "../../Config";

/**
 * Proxies delgados hacia `GET/POST/PATCH/DELETE /escuela/cuotas/*`
 * (client-gateway → `cuotas.*` de contabilidad-ms), ver
 * specs/cuotas-rediseno-contable §8. `codigoEmpresa` se inyecta
 * automáticamente por el interceptor de axios (Backend/Config/axios.js),
 * no hace falta pasarlo a mano.
 */

// ---- Listado por período con estado real (R99, R110) ----

export const listarCuotasApi = async ({
  codigoCuentaContable,
  tipoEntidadObligado,
  mes,
  anio,
  codigoUnidadNegocio,
}) => {
  const params = { codigoCuentaContable, tipoEntidadObligado, mes, anio };
  if (codigoUnidadNegocio != null && codigoUnidadNegocio !== "") {
    params.codigoUnidadNegocio = codigoUnidadNegocio;
  }
  const { data } = await axios.get("/escuela/cuotas", { params });
  return data;
};

// ---- Historial de cuotas de un contacto (ModalDeudaAlumno.jsx) ----

/**
 * Historial completo (multi-período, sin filtro de fecha) de Facturas de
 * cuota de UN contacto, con el estado real de cada comprobante. A
 * diferencia de `listarCuotasApi`, no pasa por `cuotas.listar` de
 * contabilidad-ms — pega directo a `comprobantes-ms` vía
 * `GET /escuela/cuotas/deuda-alumno`.
 */
export const obtenerDeudaAlumnoApi = async ({
  codigoContacto,
  codigoCuentaContable,
}) => {
  const { data } = await axios.get("/escuela/cuotas/deuda-alumno", {
    params: { codigoReceptor: codigoContacto, codigoCuentaContable },
  });
  return data;
};

// ---- Motor de reglas de cuota (§5) ----

export const listarCuentasTipoCuotaApi = async () => {
  const { data } = await axios.get("/escuela/cuotas/cuentas-tipo-cuota");
  return data;
};

export const listarReglasCuotaApi = async ({ codigoCuentaContable }) => {
  const params = {};
  if (codigoCuentaContable != null) params.codigoCuentaContable = codigoCuentaContable;
  const { data } = await axios.get("/escuela/cuotas/reglas", { params });
  return data;
};

export const crearReglaCuotaApi = async (dto) => {
  const { data } = await axios.post("/escuela/cuotas/reglas", dto);
  return data;
};

export const actualizarReglaCuotaApi = async (codigo, dto) => {
  const { data } = await axios.patch(`/escuela/cuotas/reglas/${codigo}`, dto);
  return data;
};

export const eliminarReglaCuotaApi = async (codigo) => {
  const { data } = await axios.delete(`/escuela/cuotas/reglas/${codigo}`);
  return data;
};

// ---- Emisión (§1) + emisión masiva asíncrona (§4) ----

/**
 * @param {Object} params
 * @param {number} params.codigoCuentaContable — "tipo de cuota"
 * @param {string} params.tipoEntidadObligado — ej. "ALUM"
 * @param {number} params.mes
 * @param {number} params.anio
 * @param {number} params.codigoTipoComprobante — 991 (Interna) | 1 (Factura A) | 6 (Factura B) | 11 (Factura C)
 * @param {number} params.puntoVenta
 * @param {number} [params.codigoUnidadNegocio]
 * @param {number} [params.montoOverride] — solo emisión individual (R54)
 * @returns {Promise<{codigoLote: number, totalItems: number}>}
 */
export const emitirLoteCuotasApi = async (params) => {
  const { data } = await axios.post("/escuela/cuotas/emitir-lote", params);
  return data;
};

export const emitirCuotaIndividualApi = async (params) => {
  const { data } = await axios.post("/escuela/cuotas/emitir-individual", params);
  return data;
};

export const listarLotesCuotasApi = async (filtros = {}) => {
  const { data } = await axios.get("/escuela/cuotas/lotes", { params: filtros });
  return data;
};

export const obtenerLoteCuotasApi = async (codigoLote) => {
  const { data } = await axios.get(`/escuela/cuotas/lotes/${codigoLote}`);
  return data;
};

export const reintentarLoteCuotasApi = async (codigoLote, codigosContacto) => {
  const { data } = await axios.post(
    `/escuela/cuotas/lotes/${codigoLote}/reintentar`,
    codigosContacto ? { codigosContacto } : {},
  );
  return data;
};
