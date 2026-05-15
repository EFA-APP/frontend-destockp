import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearEmpresaApi } from "../../api/Empresa/empresa.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useCrearEmpresa = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: crearEmpresaApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["todas-las-empresas"] });
            agregarAlerta({
                type: "success",
                message: "La empresa se ha registrado correctamente en el sistema.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al intentar crear la empresa.",
            });
        },
    });
};
