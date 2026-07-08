import { useQuery } from "@tanstack/react-query";
import { listarCajaDiariaHistorial } from "../api/tesoreria.api";
import { useAuthStore } from "../../Autenticacion/store/authenticacion.store";

export const CAJA_DIARIA_HISTORIAL_KEY = "caja-diaria-historial";

export const useHistorialCajaDiariaQuery = (filtros = {}) => {
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;

  return useQuery({
    queryKey: [CAJA_DIARIA_HISTORIAL_KEY, codigoEmpresa, filtros],
    queryFn: () => listarCajaDiariaHistorial({ ...filtros, codigoEmpresa }),
    enabled: !!codigoEmpresa,
    refetchOnWindowFocus: false,
  });
};
