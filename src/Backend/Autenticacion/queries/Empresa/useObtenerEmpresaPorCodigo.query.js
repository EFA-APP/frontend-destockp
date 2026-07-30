import { useQuery } from "@tanstack/react-query";
import { obtenerEmpresaPorCodigoApi } from "../../api/Empresa/empresa.api";

export const useObtenerEmpresaPorCodigo = (codigo, opciones = {}) => {
  return useQuery({
    queryKey: ["empresa-por-codigo", codigo],
    queryFn: () => obtenerEmpresaPorCodigoApi(codigo),
    enabled: !!codigo && opciones.enabled !== false,
  });
};
