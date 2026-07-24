import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reintentarPasoComprobanteApi } from "../../api/Comprobante/comprobante.api";

/**
 * Feature 30 (comprobante-reintentar-tesoreria-contabilidad), R35: mutation
 * sobre `POST /comprobantes/:codigo/reintentar`. Sin toast propio a
 * propósito — el manejo de éxito/error (mensaje, estado del paso pendiente)
 * lo hace `ModalReintentarComprobante.jsx`, que necesita distinguir "éxito
 * total", "éxito parcial encadenado con nuevo fallo" y "fallo directo" con
 * más detalle del que un toast genérico puede dar.
 */
export const useReintentarPasoComprobante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigo, paso }) => reintentarPasoComprobanteApi(codigo, paso),
    onSuccess: () => {
      queryClient.invalidateQueries(["comprobantes"]);
      queryClient.invalidateQueries({ queryKey: ["cuentas-corrientes"] });
    },
  });
};
