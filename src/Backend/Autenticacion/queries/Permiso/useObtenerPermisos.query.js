import { useQuery } from "@tanstack/react-query";
import { ObtenerPermisosApi } from "../../api/Permiso/permiso.api";

export const useObtenerPermisos = () => {
    return useQuery({
        queryKey: ["permisos"],
        queryFn: ObtenerPermisosApi,
        staleTime: 1000 * 60 * 10, // 10 minutos
    });
};
