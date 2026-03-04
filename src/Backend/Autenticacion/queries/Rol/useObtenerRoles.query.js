import { useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { obtenerRolesApi } from "../../api/Rol/roles.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useObtenerRoles = (filtros) => {
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    const query = useQuery({
        queryKey: ["roles", filtros],
        queryFn: () => obtenerRolesApi(filtros),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5,
    });

    const { error, isError } = query;

    useEffect(() => {
        if (isError && error) {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Hubo un error al obtener los roles",
            });
        }
    }, [isError, error, agregarAlerta]);

    return query;
}