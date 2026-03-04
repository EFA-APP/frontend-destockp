import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { obtenerUsuariosApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useObtenerUsuarios = () => {
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);
    
    const query = useQuery({
        queryKey: ["usuarios"],
        queryFn: obtenerUsuariosApi,
        staleTime: 1000 * 60 * 5,
    });

    const { error, isError } = query;

    useEffect(() => {
        if (isError && error) {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Hubo un error al obtener los usuarios",
            });
        }
    }, [isError, error, agregarAlerta]);

    return query;
};
