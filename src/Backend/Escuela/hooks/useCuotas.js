import { useQuery } from "@tanstack/react-query";
import { ListarContactosApi } from "../../Contactos/api/contactos.api";

/**
 * Hook para obtener la lista de alumnos (ALUM) con su saldo de cuenta corriente.
 *
 * Cubre: R4, R6, R7, R28
 *
 * @returns {{
 *   alumnos: Array,
 *   cargandoAlumnos: boolean,
 *   errorAlumnos: Error|null,
 *   refetch: () => void
 * }}
 */
export const useCuotas = () => {
  const {
    data: respuesta = { items: [], total: 0 },
    isLoading: cargandoAlumnos,
    isError,
    error: errorAlumnos,
    refetch,
  } = useQuery({
    queryKey: ["alumnos-cuotas"],
    queryFn: () =>
      ListarContactosApi({
        tipoEntidad: "ALUM",
        limite: 200,
        codigoCuenta: "110301005",
      }),
    staleTime: 30_000,
  });

  const alumnos = Array.isArray(respuesta)
    ? respuesta
    : respuesta?.items ?? [];

  return {
    alumnos,
    cargandoAlumnos,
    errorAlumnos: isError ? errorAlumnos : null,
    refetch,
  };
};
