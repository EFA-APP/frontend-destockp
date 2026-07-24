import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ListarVinculadosRelacionApi,
  CrearRelacionContactoApi,
  DesvincularRelacionApi,
  ObtenerContactoApi,
} from "../api/contactos.api";

// Feature 33 (contactos-relaciones-ui). Ver design.md §2.3-§2.6.

export const useVinculadosRelacionQuery = (
  codigoContacto,
  idRelacion,
  pagina = 1,
  limite = 10,
) => {
  return useQuery({
    queryKey: [
      "relaciones-vinculados",
      codigoContacto,
      idRelacion,
      pagina,
      limite,
    ],
    queryFn: () =>
      ListarVinculadosRelacionApi(codigoContacto, idRelacion, {
        pagina,
        limite,
      }),
    enabled: Boolean(codigoContacto && idRelacion),
  });
};

// §2.6: query pequeña del "contacto en foco" (relacionesDisponibles fresco
// tras alta/baja). Elevada a DashboardContactos.jsx desde la revisión del
// 2026-07-17 (design.md §1, §3.1).
export const useContactoQuery = (codigo) => {
  return useQuery({
    queryKey: ["contacto", codigo],
    queryFn: () => ObtenerContactoApi(codigo),
    enabled: Boolean(codigo),
  });
};

export const useCrearRelacionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ codigo, idRelacion, dto }) =>
      CrearRelacionContactoApi(codigo, idRelacion, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["relaciones-vinculados"] });
      queryClient.invalidateQueries({
        queryKey: ["contacto", variables.codigo],
      });
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
    },
  });
};

export const useDesvincularRelacionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ codigo, idRelacion, codigoContactoRelacionado }) =>
      DesvincularRelacionApi(codigo, idRelacion, codigoContactoRelacionado),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["relaciones-vinculados"] });
      queryClient.invalidateQueries({
        queryKey: ["contacto", variables.codigo],
      });
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
    },
  });
};
