import { useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ObtenerMateriasPrimasApi } from "../../api/MateriaPrima/materiaprima.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useObtenerMateriasPrimas = (filtros) => {
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    const query = useQuery({
        queryKey: ["materias-primas", filtros],
        queryFn: () => ObtenerMateriasPrimasApi(filtros),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5,
    });

    const { error, isError } = query;

    useEffect(() => {
        if (isError && error) {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Hubo un error al obtener las materias primas",
            });
        }
    }, [isError, error, agregarAlerta]);

    return query;
}
