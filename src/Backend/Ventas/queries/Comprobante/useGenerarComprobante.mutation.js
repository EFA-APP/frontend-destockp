import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generarComprobante } from "../../api/Comprobante/comprobante.api";
import { useAlertas } from "../../../../store/useAlertas";

/**
 * Mutation para generar un comprobante (Fiscal o No Fiscal).
 * Invalida queries relacionadas para refrescar los listados si es necesario.
 */
export const useGenerarComprobante = () => {
    const queryClient = useQueryClient();
    const { agregarAlerta } = useAlertas();

    return useMutation({
        mutationFn: generarComprobante,
        onSuccess: (data) => {
            // Invalida lo que consideres pertinente, por ejemplo listado de facturas.
            queryClient.invalidateQueries(["comprobantes"]);
            
            agregarAlerta({
                title: "Éxito",
                message: data.message || "Comprobante generado correctamente",
                type: "success",
            });
        },
        onError: (error) => {
            const mensajeError = error?.response?.data?.message || "Error al procesar el comprobante";
            agregarAlerta({
                title: "Error",
                message: mensajeError,
                type: "error",
            });
        },
    });
};
