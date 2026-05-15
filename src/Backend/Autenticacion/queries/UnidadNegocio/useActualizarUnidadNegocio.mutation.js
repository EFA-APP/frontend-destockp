import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarUnidadNegocioApi } from "../../api/UnidadNegocio/unidadesNegocio.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useActualizarUnidadNegocio = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: ({ codigo, codigoEmpresa, data }) => actualizarUnidadNegocioApi(codigo, codigoEmpresa, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unidadesNegocio"] });
            agregarAlerta({
                type: "success",
                message: "Unidad de negocio actualizada correctamente",
            });
        },
        onError: (error) => {
            console.error("Error al actualizar unidad de negocio:", error);
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Hubo un error al actualizar la unidad de negocio",
            });
        },
    });
};
