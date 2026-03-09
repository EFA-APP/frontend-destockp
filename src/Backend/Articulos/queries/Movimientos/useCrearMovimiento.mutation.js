import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CrearMovimientoApi } from "../../api/Movimientos/movimientos.api";
import { useAlertas } from "../../../../store/useAlertas";  

export const useCrearMovimiento = () => {
  const queryClient = useQueryClient();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);

  return useMutation({
    mutationFn: (data) => CrearMovimientoApi(data),
    onSuccess: () => {
      // Invalidamos productos, materia prima y movimientos para actualización en tiempo real
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["materias-primas"] });
      queryClient.invalidateQueries({ queryKey: ["movimientos"] });

      agregarAlerta({
        type: "success",
        message: "Movimiento registrado con éxito",
      });
    },
    onError: (error) => {
      const mensaje = error.response?.data?.message || "Error al registrar movimiento";
      agregarAlerta({
        type: "error",
        message: Array.isArray(mensaje) ? mensaje[0] : mensaje,
      });
    },
  });
};
