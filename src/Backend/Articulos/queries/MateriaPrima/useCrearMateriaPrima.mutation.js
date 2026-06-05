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
            const rawMsg = error?.response?.data?.message;
            const cleanMsg = Array.isArray(rawMsg)
                ? rawMsg.join(", ")
                : typeof rawMsg === "object" && rawMsg !== null
                ? JSON.stringify(rawMsg)
                : rawMsg || "Ocurrió un error al crear la materia prima";

            agregarAlerta({
                type: "error",
                message: cleanMsg,
            });
        }
    });
};
