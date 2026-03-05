import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchObtenerSeccionesApi } from "../../api/Secciones/seccion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useObtenerSeccionesQuery = () => {
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    const query = useQuery({
        queryKey: ["obtenerSecciones"],
        queryFn: fetchObtenerSeccionesApi,
        staleTime: 1000 * 60 * 60, // 1 hour
        cacheTime: 1000 * 60 * 60 * 2, // 2 hours
    });

    const { error, isError } = query;

    useEffect(() => {
        if (isError && error) {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Hubo un error al obtener las secciones del menú",
            });
        }
    }, [isError, error, agregarAlerta]);

    return query;
};
