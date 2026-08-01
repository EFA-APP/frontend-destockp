import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ListarBeneficiosAdminApi,
  CrearBeneficioAdminApi,
  AprobarBeneficioApi,
  PausarBeneficioAdminApi,
  ReanudarBeneficioAdminApi,
  RechazarBeneficioApi,
} from "../api/beneficios.api";

export const useBeneficiosAdmin = (filtros = {}) => {
  const queryClient = useQueryClient();

  const { data: beneficios = [], isLoading: cargandoBeneficios } = useQuery({
    queryKey: ["beneficios-admin", filtros],
    queryFn: () => ListarBeneficiosAdminApi(filtros),
    refetchInterval: 3000,
  });

  const mutationCrear = useMutation({
    mutationFn: CrearBeneficioAdminApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficios-admin"] });
    },
    onError: (error) => {
      console.error("Error al crear el beneficio", error?.response?.data?.message);
    },
  });

  const mutationAprobar = useMutation({
    mutationFn: AprobarBeneficioApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficios-admin"] });
    },
    onError: (error) => {
      console.error("Error al aprobar el beneficio", error?.response?.data?.message);
    },
  });

  const mutationRechazar = useMutation({
    mutationFn: RechazarBeneficioApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficios-admin"] });
    },
    onError: (error) => {
      console.error("Error al rechazar el beneficio", error?.response?.data?.message);
    },
  });

  const mutationPausar = useMutation({
    mutationFn: PausarBeneficioAdminApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficios-admin"] });
    },
    onError: (error) => {
      console.error("Error al pausar el beneficio", error?.response?.data?.message);
    },
  });

  const mutationReanudar = useMutation({
    mutationFn: ReanudarBeneficioAdminApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficios-admin"] });
    },
    onError: (error) => {
      console.error("Error al reanudar el beneficio", error?.response?.data?.message);
    },
  });

  return {
    beneficios,
    cargandoBeneficios,
    crearBeneficio: mutationCrear.mutateAsync,
    aprobarBeneficio: mutationAprobar.mutateAsync,
    rechazarBeneficio: mutationRechazar.mutateAsync,
    pausarBeneficio: mutationPausar.mutateAsync,
    reanudarBeneficio: mutationReanudar.mutateAsync,
  };
};
