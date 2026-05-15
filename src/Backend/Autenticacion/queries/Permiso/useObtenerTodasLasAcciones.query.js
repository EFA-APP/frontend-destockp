import { useQuery } from "@tanstack/react-query";
import { fetchObtenerTodasLasAccionesApi, fetchObtenerTodasLasAccionesGlobalesApi } from "../../api/Permiso/permiso.api";

export const useObtenerTodasLasAcciones = (filtros = {}) => {
    return useQuery({
        queryKey: ["todasLasAcciones", filtros],
        queryFn: () => fetchObtenerTodasLasAccionesApi(filtros),
        staleTime: 1000 * 60 * 30, // 30 mins
    });
};

export const useObtenerTodasLasAccionesGlobales = () => {
    return useQuery({
        queryKey: ["todasLasAccionesGlobales"],
        queryFn: () => fetchObtenerTodasLasAccionesGlobalesApi(),
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};
