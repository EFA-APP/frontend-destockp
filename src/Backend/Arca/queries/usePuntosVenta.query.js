import { useQuery } from "@tanstack/react-query";
import { ObtenerPuntosVentaApi } from "../api/arca.api";

export const usePuntosVenta = (codigoEmpresa) => {
  return useQuery({
    queryKey: ["puntos-venta-arca", codigoEmpresa],
    queryFn: () => ObtenerPuntosVentaApi({ codigoEmpresa }),
    enabled: !!codigoEmpresa,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
