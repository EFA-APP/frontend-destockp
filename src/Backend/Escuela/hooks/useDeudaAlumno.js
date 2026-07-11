import { useQuery } from "@tanstack/react-query";
import { obtenerDeudaAlumnoApi } from "../api/cuotas.api";

/**
 * Hook para obtener el historial de cuotas emitidas (multi-período) de un
 * alumno específico, para un `codigoCuentaContable` ("tipo de cuota") dado.
 *
 * Reescrito para consumir la fuente de verdad real (`Comprobante`, vía
 * `comprobantes.listarCuotasContacto`/`GET /escuela/cuotas/deuda-alumno`)
 * en vez de reconstruir Debe/Haber desde asientos contables filtrados por
 * `origenModulo: "ESCUELA"` — ese mecanismo viejo nunca devolvía resultados
 * para cuotas emitidas con el mecanismo nuevo (feature 19,
 * `cuotas-rediseno-contable`), que no tagea `origenModulo`/`referencia` por
 * diseño.
 *
 * @param {{ codigoContacto: number, codigoCuentaContable?: number }} params
 * @returns {{
 *   comprobantesCuota: Array,
 *   cargandoDeuda: boolean
 * }}
 */
export const useDeudaAlumno = ({ codigoContacto, codigoCuentaContable }) => {
  const { data: comprobantesCuota = [], isLoading: cargandoDeuda } = useQuery(
    {
      queryKey: ["deuda-alumno", codigoContacto, codigoCuentaContable],
      queryFn: () =>
        obtenerDeudaAlumnoApi({ codigoContacto, codigoCuentaContable }),
      enabled: !!codigoContacto && !!codigoCuentaContable,
      staleTime: 30_000,
    },
  );

  return {
    comprobantesCuota,
    cargandoDeuda,
  };
};
