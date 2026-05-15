import { useQuery } from "@tanstack/react-query";
import { obtenerTodasLasEmpresasApi } from "../../api/Empresa/empresa.api";

export const useEmpresas = () => {
  return useQuery({
    queryKey: ["todas-las-empresas"],
    queryFn: obtenerTodasLasEmpresasApi,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
