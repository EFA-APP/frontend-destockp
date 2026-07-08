import { useQuery } from "@tanstack/react-query";
import { listarAsientos } from "../../Contabilidad/api/asientos.api";

/**
 * Hook para obtener el historial de cuotas emitidas de un alumno específico.
 * Filtra asientos por referencia con patrón "CUOTA-{codigoContacto}-*".
 *
 * Cubre: R29
 *
 * @param {{ codigoEmpresa: number, codigoContacto: number }} params
 * @returns {{
 *   asientosCuota: Array,
 *   cargandoDeuda: boolean
 * }}
 */
export const useDeudaAlumno = ({ codigoEmpresa, codigoContacto }) => {
  const { data: asientos = [], isLoading: cargandoDeuda } = useQuery({
    queryKey: ["deuda-alumno", codigoEmpresa, codigoContacto],
    queryFn: () =>
      listarAsientos({
        codigoEmpresa,
        origenModulo: "ESCUELA",
      }),
    enabled: !!codigoEmpresa && !!codigoContacto,
    staleTime: 30_000,
  });

  const prefijoBusqueda = `CUOTA-${codigoContacto}-`;
  const asientosCuota = Array.isArray(asientos)
    ? asientos.filter((a) => a.referencia?.startsWith(prefijoBusqueda))
    : [];

  return {
    asientosCuota,
    cargandoDeuda,
  };
};
