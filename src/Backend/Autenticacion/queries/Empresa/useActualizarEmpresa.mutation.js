import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarDatosFiscalesApi } from "../../api/Empresa/empresa.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useActualizarEmpresa = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: actualizarDatosFiscalesApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todas-las-empresas"] });
            agregarAlerta({
                type: "success",
                message: "La empresa se ha actualizado correctamente.",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al intentar actualizar la empresa.",
            });
        },
    });
};
