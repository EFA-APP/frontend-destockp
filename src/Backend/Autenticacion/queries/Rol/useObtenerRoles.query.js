import { useQuery } from "@tanstack/react-query";
import { obtenerRolesApi } from "../../api/Rol/roles.api";

export const useObtenerRoles = (filtros) => {
    return useQuery({
        queryKey: ["roles", filtros],
        queryFn: () => obtenerRolesApi(filtros),
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
    });
}