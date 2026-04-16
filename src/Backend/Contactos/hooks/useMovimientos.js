import { useQuery } from "@tanstack/react-query";
import { ListarMovimientosApi } from "../api/contactos.api";

export const useMovimientos = (codigoContacto) => {
  const {
    data: movimientos = [],
    isLoading: cargandoMovimientos,
    refetch,
  } = useQuery({
    queryKey: ["movimientos", codigoContacto],
    queryFn: () => ListarMovimientosApi(codigoContacto),
    enabled: !!codigoContacto, // Solo disparar si hay un contacto seleccionado
  });

  return {
    movimientos,
    cargandoMovimientos,
    refetch,
  };
};
