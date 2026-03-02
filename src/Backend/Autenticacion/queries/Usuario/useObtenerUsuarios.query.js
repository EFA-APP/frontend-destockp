import { useQuery } from "@tanstack/react-query";
import { obtenerUsuariosApi } from "../../api/Usuario/authenticacion.api";

export const useObtenerUsuarios = () => {
    return useQuery({
        queryKey: ["usuarios"],
        queryFn: obtenerUsuariosApi,
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
    });
};
