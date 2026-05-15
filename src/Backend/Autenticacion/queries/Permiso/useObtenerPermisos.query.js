import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ObtenerPermisosApi } from "../../api/Permiso/permiso.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useObtenerPermisos = (filtros = {}) => {
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);
    
    const query = useQuery({
        queryKey: ["permisos", filtros],
        queryFn: () => ObtenerPermisosApi(filtros),
        staleTime: 1000 * 60 * 10, // 10 minutos
    });

    const { error, isError } = query;

    useEffect(() => {
        if (isError && error) {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Hubo un error al obtener los permisos",
            });
        }
    }, [isError, error, agregarAlerta]);

    return query;
};
