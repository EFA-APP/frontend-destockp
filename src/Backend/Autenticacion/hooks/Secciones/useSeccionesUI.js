import { useObtenerSeccionesQuery } from "../../queries/Secciones/useObtenerSecciones.query";

export const useSeccionesUI = () => {
  const seccionesQuery = useObtenerSeccionesQuery();

  return {
    secciones: Array.isArray(seccionesQuery.data)
      ? seccionesQuery.data
      : seccionesQuery.data?.secciones || [],
    cargandoSecciones: seccionesQuery.isLoading,
    errorSecciones: seccionesQuery.error,
    refetchSecciones: seccionesQuery.refetch,
  };
};
