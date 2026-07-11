import { useQuery } from "@tanstack/react-query";
import { listarLotesCuotasApi } from "../api/cuotas.api";

/**
 * Historial de lotes de emisión (`cuotas.lotes.listar`, R48), usado para
 * encontrar el lote más reciente de un scope EXACTO (cuenta contable +
 * unidad de negocio + período) — así el progreso/resultado de una emisión
 * masiva no se pierde al cambiar de sección o navegar de vuelta a
 * `GestionCuotas.jsx`: la fuente de verdad es siempre el backend (mismo
 * criterio que `useLoteCuotas`), nunca `localStorage`.
 *
 * `listarLotesCuotasApi` ya devuelve ordenado por `fechaInicio desc` (ver
 * `ListarLotesEmisionCuotas.casodeuso.ts`), así que el primer elemento es
 * siempre el más reciente del scope filtrado.
 */
export const useUltimoLoteCuotas = ({
  codigoCuentaContable,
  codigoUnidadNegocio,
  mes,
  anio,
}) => {
  const { data, isLoading: cargandoUltimoLote, refetch: refetchUltimoLote } = useQuery({
    queryKey: ["lotes-cuota", codigoCuentaContable, codigoUnidadNegocio, mes, anio],
    queryFn: () =>
      listarLotesCuotasApi({
        codigoCuentaContable,
        codigoUnidadNegocio,
        mes,
        anio,
      }),
    enabled: !!codigoCuentaContable && !!codigoUnidadNegocio,
    staleTime: 10_000,
  });

  return {
    ultimoLote: data?.[0] ?? null,
    cargandoUltimoLote,
    refetchUltimoLote,
  };
};
