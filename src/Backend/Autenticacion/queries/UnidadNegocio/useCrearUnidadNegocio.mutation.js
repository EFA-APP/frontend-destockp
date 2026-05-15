import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearUnidadNegocioApi } from "../../api/UnidadNegocio/unidadesNegocio.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useCrearUnidadNegocio = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: ({ codigoEmpresa, data }) => crearUnidadNegocioApi(codigoEmpresa, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unidadesNegocio"] });
            agregarAlerta({
                type: "success",
                message: "Unidad de negocio creada correctamente",
            });
        },
        onError: (error) => {
            console.error("Error al crear unidad de negocio:", error);
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Hubo un error al crear la unidad de negocio",
            });
        },
    });
};
