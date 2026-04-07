import { useQuery } from "@tanstack/react-query";
import { ObtenerMovimientosApi } from "../../api/Movimientos/movimientos.api";

export const useObtenerMovimientos = (codigoArticulo, tipoArticulo, fechaInicio, fechaFin, busqueda, pagina = 1, limite = 15) => {
  return useQuery({
    queryKey: ["movimientos", tipoArticulo, codigoArticulo, fechaInicio, fechaFin, busqueda, pagina, limite],
    queryFn: () => ObtenerMovimientosApi({ 
      codigoArticulo, 
      tipoArticulo,
      fechaInicio,
      fechaFin,
      busqueda,
      pagina,
      limite
    }),
    enabled: !!tipoArticulo,
    staleTime: 1000 * 60, // 1 minuto para historial
  });
};
