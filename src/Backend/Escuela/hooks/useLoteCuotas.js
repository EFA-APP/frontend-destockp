import { useQuery } from "@tanstack/react-query";
import { obtenerLoteCuotasApi } from "../api/cuotas.api";

const LOTES_TERMINALES = ["FINALIZADO"];

/**
 * Polling del progreso de un `LoteEmisionCuotas` (R47), usado por
 * `ModalProgresoLoteCuotas.jsx`. Deja de hacer polling apenas el lote
 * queda `FINALIZADO`.
 */
export const useLoteCuotas = (codigoLote) => {
  const { data: lote, isLoading: cargandoLote } = useQuery({
    queryKey: ["lote-cuotas", codigoLote],
    queryFn: () => obtenerLoteCuotasApi(codigoLote),
    enabled: !!codigoLote,
    refetchInterval: (query) =>
      query.state.data && LOTES_TERMINALES.includes(query.state.data.estado)
        ? false
        : 2_000,
  });

  return { lote, cargandoLote };
};
