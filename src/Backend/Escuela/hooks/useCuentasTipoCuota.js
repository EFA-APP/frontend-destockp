import { useQuery } from "@tanstack/react-query";
import { listarCuentasTipoCuotaApi } from "../api/cuotas.api";

/**
 * Cuentas contables candidatas a ser "tipo de cuota" (R60), para el
 * selector de `GestionCuotas.jsx`.
 */
export const useCuentasTipoCuota = () => {
  const { data: cuentas = [], isLoading: cargandoCuentas } = useQuery({
    queryKey: ["cuentas-tipo-cuota"],
    queryFn: () => listarCuentasTipoCuotaApi(),
    staleTime: 60_000,
  });

  return { cuentas, cargandoCuentas };
};
