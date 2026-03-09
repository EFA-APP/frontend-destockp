import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActualizarMateriaPrimaApi } from "../../api/MateriaPrima/materiaprima.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useActualizarMateriaPrima = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: ({ id, data }) => ActualizarMateriaPrimaApi(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["materias-primas"] });
            queryClient.invalidateQueries({ queryKey: ["movimientos"] });
            agregarAlerta({
                type: "success",
                message: "Materia prima actualizada correctamente",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al actualizar la materia prima",
            });
        }
    });
};
