import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EliminarMovimientoApi } from "../../api/Movimientos/movimientos.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useEliminarMovimiento = () => {
  const queryClient = useQueryClient();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);

  return useMutation({
    mutationFn: (data) => EliminarMovimientoApi(data),
    onSuccess: () => {
      // Invalidamos productos, materia prima y movimientos para actualización en tiempo real
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["materias-primas"] });
      queryClient.invalidateQueries({ queryKey: ["movimientos"] });

      agregarAlerta({
        type: "success",
        message: "Movimiento eliminado y stock revertido con éxito",
      });
    },
    onError: (error) => {
      const mensaje = error.response?.data?.message || "Error al eliminar el movimiento";
      agregarAlerta({
        type: "error",
        message: Array.isArray(mensaje) ? mensaje[0] : mensaje,
      });
    },
  });
};
