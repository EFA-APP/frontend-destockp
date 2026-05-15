import { useQuery } from "@tanstack/react-query";
import { fetchObtenerSeccionesGlobalesApi } from "../../api/Secciones/seccion.api";

export const useObtenerSeccionesGlobales = () => {
    return useQuery({
        queryKey: ["secciones-globales"],
        queryFn: fetchObtenerSeccionesGlobalesApi,
        staleTime: 1000 * 60 * 30, // 30 minutos (los catalogos no cambian seguido)
    });
};
