import { useQuery } from "@tanstack/react-query";
import { resumenCuotasApi } from "../api/cuotas.api";

/**
 * Hook para los KPIs agregados del dashboard de cuotas (`cuotas.resumen`,
 * ver progress/impl_cuotas-listado-performance-backend.md — PARTE 1/2
 * backend, ya verificada). Mismos filtros que `useListarCuotas.js` MENOS
 * `pagina`/`busqueda`.
 *
 * A propósito la `queryKey` NO incluye `pagina`/`busqueda`: cambiar de
 * página o tipear en el buscador de `TablaCuotas.jsx`/`TablaCuotasSocios.jsx`
 * NO debe disparar un refetch de estos números — el Dashboard siempre debe
 * mostrar el total real del período/filtros activos, sin importar la
 * búsqueda/página activa (confirmado con el humano).
 *
 * @param {{
 *   codigoCuentaContable: number|string,
 *   tipoEntidadObligado?: string,
 *   mes: number,
 *   anio: number,
 *   codigoUnidadNegocio?: number|string,
 * }} params
 */
export const useResumenCuotas = ({
  codigoCuentaContable,
  tipoEntidadObligado = "ALUM",
  mes,
  anio,
  codigoUnidadNegocio,
}) => {
  const {
    data,
    isLoading: cargandoResumen,
    isError,
    error: errorResumen,
    refetch,
  } = useQuery({
    queryKey: [
      "cuotas-resumen",
      codigoCuentaContable,
      tipoEntidadObligado,
      mes,
      anio,
      codigoUnidadNegocio,
    ],
    queryFn: () =>
      resumenCuotasApi({
        codigoCuentaContable,
        tipoEntidadObligado,
        mes,
        anio,
        codigoUnidadNegocio,
      }),
    // Mismo criterio `enabled` que `useListarCuotas.js`.
    enabled: !!codigoCuentaContable && !!codigoUnidadNegocio,
    staleTime: 15_000,
  });

  return {
    resumen: data ?? {
      pagadas: 0,
      vencidas: 0,
      parciales: 0,
      sinEmitir: 0,
      totalContactos: 0,
      deudaTotal: 0,
      // Optimización de performance (PARTE 3): montos reales del universo
      // completo, ver progress/impl_cuotas-listado-performance-backend.md.
      totalEmitido: 0,
      totalCobrado: 0,
    },
    cargandoResumen,
    errorResumen: isError ? errorResumen : null,
    refetch,
  };
};
