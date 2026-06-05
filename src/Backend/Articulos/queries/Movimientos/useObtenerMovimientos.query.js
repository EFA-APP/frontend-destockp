import { useQuery } from "@tanstack/react-query";
import { ObtenerMovimientosApi } from "../../api/Movimientos/movimientos.api";

export const useObtenerMovimientos = (codigoArticulo, tipoArticulo, fechaInicio, fechaFin, busqueda, pagina = 1, limite = 15, codigoDeposito = "") => {
  return useQuery({
    queryKey: ["movimientos", tipoArticulo, codigoArticulo, fechaInicio, fechaFin, busqueda, pagina, limite, codigoDeposito],
    queryFn: () => ObtenerMovimientosApi({ 
      codigoArticulo, 
      tipoArticulo,
      fechaInicio,
      fechaFin,
      busqueda,
      pagina,
      limite,
      codigoDeposito
    }),
    enabled: !!tipoArticulo,
    staleTime: 1000 * 60, // 1 minuto para historial
  });
};
