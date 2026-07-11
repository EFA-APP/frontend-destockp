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
export const useCuotas = (codigoUnidadNegocio) => {
  const {
    data: respuesta = { items: [], total: 0 },
    isLoading: cargandoAlumnos,
    isError,
    error: errorAlumnos,
    refetch,
  } = useQuery({
    queryKey: ["alumnos-cuotas", codigoUnidadNegocio],
    queryFn: () => {
      const params = {
        tipoEntidad: "ALUM",
        limite: 99999,
        codigoCuenta: "110301005",
      };
      if (codigoUnidadNegocio) {
        params.codigoUnidadNegocio = Number(codigoUnidadNegocio);
      }
      return ListarContactosApi(params);
    },
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
