import { useQuery } from "@tanstack/react-query";
import { obtenerUsuariosPorEmpresaApi } from "../../api/Usuario/authenticacion.api";

export const useObtenerUsuarios = (codigoEmpresa) => {
    return useQuery({
        queryKey: ["usuarios", codigoEmpresa],
        queryFn: () => obtenerUsuariosPorEmpresaApi(codigoEmpresa),
        enabled: !!codigoEmpresa,
        staleTime: 1000 * 60 * 10, // 10 mins
    });
};
