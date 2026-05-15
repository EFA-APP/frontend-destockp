import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { obtenerUnidadesNegocioApi } from "../../api/UnidadNegocio/unidadesNegocio.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useObtenerUnidadesNegocio = (filtros = {}) => {
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);
    
    const query = useQuery({
        queryKey: ["unidadesNegocio", filtros],
        queryFn: () => obtenerUnidadesNegocioApi(filtros),
        staleTime: 1000 * 60 * 5, // 5 minutos
        enabled: !!filtros.codigoEmpresa,
    });

    const { error, isError } = query;

    useEffect(() => {
        if (isError && error) {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Hubo un error al obtener las unidades de negocio",
            });
        }
    }, [isError, error, agregarAlerta]);

    return query;
};
