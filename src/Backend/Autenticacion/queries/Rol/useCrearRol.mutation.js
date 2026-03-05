import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearRolesApi } from "../../api/Rol/roles.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useCrearRol = () => {
    const queryClient = useQueryClient();
    const agregarAlerta = useAlertas((state) => state.agregarAlerta);

    return useMutation({
        mutationFn: crearRolesApi,
        onSuccess: () => {
            queryClient.invalidateQueries(["roles"]);
            agregarAlerta({
                type: "success",
                message: "Rol creado correctamente",
            });
        },
        onError: (error) => {
            agregarAlerta({
                type: "error",
                message: error?.response?.data?.message || "Ocurrió un error al crear el rol",
            });
        }
    });
};
