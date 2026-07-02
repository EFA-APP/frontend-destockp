import { useQuery } from "@tanstack/react-query";
import { ConsultarLogsArcaApi } from "../api/arca.api";

export const useConsultarLogsArca = (params) => {
  return useQuery({
    queryKey: ["logs-arca", params],
    queryFn: () => ConsultarLogsArcaApi(params),
    enabled: !!params?.codigoEmpresa,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
