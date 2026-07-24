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
            // Invalidar todos los listados de comprobantes y deudas para que reflejen
            // instantáneamente el pago/recibo recién emitido
            queryClient.invalidateQueries({ queryKey: ["comprobantes"] });
            queryClient.invalidateQueries({ queryKey: ["deuda-alumno"] });
            queryClient.invalidateQueries({ queryKey: ["cuotas-listar"] });
            queryClient.invalidateQueries({ queryKey: ["deudas-cobro-cuota"] });
            queryClient.invalidateQueries({ queryKey: ["cuentas-corrientes"] });
            
            agregarAlerta({
                title: "Éxito",
                message: data.message || "Comprobante generado correctamente",
                type: "success",
            });
        },
        onError: (error) => {
            // Feature 30 (comprobante-reintentar-tesoreria-contabilidad),
            // R32: si el comprobante SÍ se generó pero falló tesorería o
            // contabilidad, el aviso específico + botón "Reintentar" lo da
            // ModalReintentarComprobante (abierto por el `onError`
            // por-llamada de cada pantalla, ver Ingresos/Egresos/Recibos/
            // OrdenPago.jsx) — se evita el toast genérico duplicado/contradictorio.
            const code = error?.response?.data?.code;
            if (code === "MOVIMIENTO_FINANCIERO_FALLIDO" || code === "ASIENTO_CONTABLE_FALLIDO") {
                return;
            }
            const mensajeError = error?.response?.data?.message || "Error al procesar el comprobante";
            agregarAlerta({
                title: "Error",
                message: mensajeError,
                type: "error",
            });
        },
    });
};
