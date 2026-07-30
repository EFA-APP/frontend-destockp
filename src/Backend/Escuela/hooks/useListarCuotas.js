import { useQuery } from "@tanstack/react-query";
import { listarCuotasApi } from "../api/cuotas.api";

/**
 * Hook para el listado de cuotas de un período con estado real (R99),
 * reemplazando `useListarAsientosQuery` + `calcularEstadoCuota`.
 *
 * Optimización de performance (2026-07-14, ver
 * progress/impl_cuotas-listado-performance-backend.md — PARTE 1/2 backend,
 * ya verificada): ahora acepta `pagina`/`busqueda`, propagados tal cual al
 * backend (antes `cuotas.listar` siempre traía hasta 5000 filas fijas). La
 * `queryKey` incluye `pagina`/`busqueda` a propósito — a diferencia de
 * `useResumenCuotas.js` — para que cambiar de página o buscar SÍ dispare un
 * refetch de este listado.
 *
 * PARTE 3 (`filtroEstado`): también incluido en la `queryKey` a propósito
 * — el filtro de Estado ahora lo resuelve el backend (universo completo,
 * filtra y RECIÉN AHÍ pagina), reemplazando el filtro en memoria que antes
 * vivía en `TablaCuotas.jsx`/`TablaCuotasSocios.jsx` (limitado a la página
 * actual).
 *
 * @param {{
 *   codigoCuentaContable: number|string,
 *   tipoEntidadObligado?: string,
 *   mes: number,
 *   anio: number,
 *   codigoUnidadNegocio?: number|string,
 *   pagina?: number,
 *   busqueda?: string,
 *   filtroEstado?: string,
 * }} params
 */
export const useListarCuotas = ({
  codigoCuentaContable,
  tipoEntidadObligado = "ALUM",
  mes,
  anio,
  codigoUnidadNegocio,
  pagina = 1,
  busqueda = "",
  filtroEstado = "TODOS",
  filtroTipo = "TODOS",
}) => {
  const {
    data,
    isLoading: cargandoCuotas,
    isError,
    error: errorCuotas,
    refetch,
  } = useQuery({
    queryKey: [
      "cuotas-listar",
      codigoCuentaContable,
      tipoEntidadObligado,
      mes,
      anio,
      codigoUnidadNegocio,
      pagina,
      busqueda,
      filtroEstado,
      filtroTipo,
    ],
    queryFn: () =>
      listarCuotasApi({
        codigoCuentaContable,
        tipoEntidadObligado,
        mes,
        anio,
        codigoUnidadNegocio,
        pagina,
        busqueda,
        filtroEstado,
        filtroTipo,
      }),
    // GestionCuotas.jsx ya no ofrece la opción "Todas las Unidades" (siempre
    // autoselecciona la primera unidad del usuario) — se espera un
    // `codigoUnidadNegocio` real antes de disparar la consulta, para no
    // traer datos mezclados de todas las unidades mientras se resuelve el
    // autoselect.
    enabled: !!codigoCuentaContable && !!codigoUnidadNegocio,
    staleTime: 15_000,
  });

  return {
    items: data?.items ?? [],
    fechaVto: data?.fechaVto ?? null,
    total: data?.total ?? 0,
    paginas: data?.paginas ?? 1,
    paginaActual: data?.paginaActual ?? pagina,
    cargandoCuotas,
    errorCuotas: isError ? errorCuotas : null,
    refetch,
  };
};
