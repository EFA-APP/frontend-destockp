import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActualizarMateriaPrimaApi } from "../../api/MateriaPrima/materiaprima.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useEliminarMateriaPrima = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: (id) => ActualizarMateriaPrimaApi(id, { activo: false }),
        onSuccess: () => {
            queryClient.invalidateQueries(["materias-primas"]);
            agregarAlerta({
                type: "success",
                message: "Materia prima eliminada correctamente",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al eliminar la materia prima",
            });
        }
    });
};
