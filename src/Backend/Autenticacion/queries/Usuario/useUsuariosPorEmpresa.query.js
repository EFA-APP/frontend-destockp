import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { obtenerUsuariosPorEmpresaApi } from "../../api/Usuario/authenticacion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useUsuariosPorEmpresa = (codigoEmpresa) => {
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);
    
    const query = useQuery({
        queryKey: ["usuarios-empresa", codigoEmpresa],
        queryFn: () => obtenerUsuariosPorEmpresaApi(codigoEmpresa),
        enabled: !!codigoEmpresa, // Solo ejecuta si hay código de empresa
        staleTime: 1000 * 60 * 5,
    });

    const { error, isError } = query;

    useEffect(() => {
        if (isError && error) {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Hubo un error al obtener los usuarios de la empresa",
            });
        }
    }, [isError, error, agregarAlerta]);

    return query;
};
