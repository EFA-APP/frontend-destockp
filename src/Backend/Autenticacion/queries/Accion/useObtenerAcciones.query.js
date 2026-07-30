import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { obtenerAccionesApi } from "../../api/Accion/accion.api";
import { useAlertas } from "../../../../store/useAlertas";

// Reemplaza a useObtenerPermisos/useObtenerTodasLasAccionesGlobales
// (R7, R26): catálogo global, sin filtro de empresa.
export const useObtenerAcciones = () => {
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    const query = useQuery({
        queryKey: ["acciones"],
        queryFn: obtenerAccionesApi,
        staleTime: 1000 * 60 * 30, // 30 minutos (catálogo, no cambia seguido)
    });

    const { error, isError } = query;

    useEffect(() => {
        if (isError && error) {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Hubo un error al obtener las acciones",
            });
        }
    }, [isError, error, agregarAlerta]);

    return query;
};
