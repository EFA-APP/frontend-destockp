import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eliminarUnidadNegocioApi } from "../../api/UnidadNegocio/unidadesNegocio.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useEliminarUnidadNegocio = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: ({ codigo, codigoEmpresa }) => eliminarUnidadNegocioApi(codigo, codigoEmpresa),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unidadesNegocio"] });
            agregarAlerta({
                type: "success",
                message: "Unidad de negocio eliminada correctamente",
            });
        },
        onError: (error) => {
            console.error("Error al eliminar unidad de negocio:", error);
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Hubo un error al eliminar la unidad de negocio",
            });
        },
    });
};
