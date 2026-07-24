import { useQuery } from "@tanstack/react-query";
import { evolucionCuotasApi } from "../api/cuotas.api";

/**
 * Bugfix "cuotas-evolucion-facturas-reales": hook para la evolución mensual
 * (últimos 6 meses) de Facturas de cuota reales, reemplazando el mecanismo
 * viejo (`useListarAsientosQuery({ origenModulo: "ESCUELA" })` +
 * `evolucionData` calculado a mano en `DashboardCuotas.jsx`), que dejó de
 * reflejar los datos desde `cuotas-rediseno-contable`.
 *
 * @param {{
 *   codigoCuentaContable: number|string,
 *   mes: number,
 *   anio: number,
 * }} params
 */
export const useEvolucionCuotas = ({ codigoCuentaContable, mes, anio }) => {
  const {
    data,
    isLoading: cargandoEvolucion,
    isError,
    error: errorEvolucion,
    refetch,
  } = useQuery({
    queryKey: ["cuotas-evolucion", codigoCuentaContable, mes, anio],
    queryFn: () => evolucionCuotasApi({ codigoCuentaContable, mes, anio }),
    // Mismo criterio `enabled` que `useListarCuotas.js`: no disparar la
    // consulta hasta tener una cuenta de cuota y un período seleccionados.
    enabled: !!codigoCuentaContable && !!mes && !!anio,
    staleTime: 15_000,
  });

  return {
    evolucion: data ?? [],
    cargandoEvolucion,
    errorEvolucion: isError ? errorEvolucion : null,
    refetch,
  };
};
