import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CrearMateriaPrimaApi } from "../../api/MateriaPrima/materiaprima.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useCrearMateriaPrima = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: CrearMateriaPrimaApi,
        onSuccess: () => {
            queryClient.invalidateQueries(["materias-primas"]);
            agregarAlerta({
                type: "success",
                message: "Materia prima creada correctamente",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al crear la materia prima",
            });
        }
    });
};
