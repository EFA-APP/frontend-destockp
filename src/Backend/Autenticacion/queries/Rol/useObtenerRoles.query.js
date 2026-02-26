import { useQuery } from "@tanstack/react-query";
import { obtenerRolesApi } from "../../Backend/Role/roles.api";

export const useObtenerRoles = () => {
    return useQuery({
        queryKey: ["roles"],
        queryFn: obtenerRolesApi,
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
    });
}