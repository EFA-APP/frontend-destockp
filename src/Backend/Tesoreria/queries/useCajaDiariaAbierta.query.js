import { useQuery } from "@tanstack/react-query";
import { obtenerCajaDiariaAbierta } from "../api/tesoreria.api";
import { useAuthStore } from "../../Autenticacion/store/authenticacion.store";

export const CAJA_DIARIA_ABIERTA_KEY = "caja-diaria-abierta";

export const useCajaDiariaAbiertaQuery = (codigoUnidadNegocio) => {
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;

  return useQuery({
    queryKey: [CAJA_DIARIA_ABIERTA_KEY, codigoEmpresa, codigoUnidadNegocio],
    queryFn: () => obtenerCajaDiariaAbierta({ codigoEmpresa, codigoUnidadNegocio }),
    enabled: !!codigoEmpresa,
    refetchOnWindowFocus: false,
  });
};
