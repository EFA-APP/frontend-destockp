import { useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ObtenerMateriasPrimasApi } from "../../api/MateriaPrima/materiaprima.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useObtenerMateriasPrimas = (filtros, options = {}) => {
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    const query = useQuery({
        queryKey: ["materias-primas", filtros],
        queryFn: () => ObtenerMateriasPrimasApi(filtros),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5,
        ...options
    });

    const { error, isError } = query;

    useEffect(() => {
        if (isError && error) {
            const rawMsg = error?.response?.data?.message;
            const cleanMsg = Array.isArray(rawMsg)
                ? rawMsg.join(", ")
                : typeof rawMsg === "object" && rawMsg !== null
                ? JSON.stringify(rawMsg)
                : rawMsg || "Hubo un error al obtener las materias primas";

            agregarAlerta({
                type: "error",
                message: cleanMsg,
            });
        }
    }, [isError, error, agregarAlerta]);

    return query;
}
