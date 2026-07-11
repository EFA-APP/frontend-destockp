import { useQuery } from "@tanstack/react-query";
import { listarCuotasApi } from "../api/cuotas.api";

/**
 * Hook para el listado de cuotas de un período con estado real (R99),
 * reemplazando `useListarAsientosQuery` + `calcularEstadoCuota`.
 *
 * @param {{
 *   codigoCuentaContable: number|string,
 *   tipoEntidadObligado?: string,
 *   mes: number,
 *   anio: number,
 *   codigoUnidadNegocio?: number|string,
 * }} params
 */
export const useListarCuotas = ({
  codigoCuentaContable,
  tipoEntidadObligado = "ALUM",
  mes,
  anio,
  codigoUnidadNegocio,
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
    ],
    queryFn: () =>
      listarCuotasApi({
        codigoCuentaContable,
        tipoEntidadObligado,
        mes,
        anio,
        codigoUnidadNegocio,
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
    cargandoCuotas,
    errorCuotas: isError ? errorCuotas : null,
    refetch,
  };
};
