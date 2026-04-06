import { useQuery } from "@tanstack/react-query";
import { ObtenerMovimientosApi } from "../../api/Movimientos/movimientos.api";

export const useObtenerMovimientos = (codigoArticulo, tipoArticulo, fechaInicio, fechaFin, busqueda) => {
  return useQuery({
    queryKey: ["movimientos", tipoArticulo, codigoArticulo, fechaInicio, fechaFin, busqueda],
    queryFn: () => ObtenerMovimientosApi({ 
      codigoArticulo, 
      tipoArticulo,
      fechaInicio,
      fechaFin,
      busqueda
    }),
    enabled: !!tipoArticulo,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
