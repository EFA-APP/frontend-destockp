import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IngresarProduccionApi } from "../../api/Produccion/produccion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useCrearProduccion = () => {
  const queryClient = useQueryClient();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);

  return useMutation({
    mutationFn: (data) => IngresarProduccionApi(data),
    onSuccess: () => {
      // Invalidamos productos, materia prima y movimientos para actualización en tiempo real
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["materias-primas"] });
      queryClient.invalidateQueries({ queryKey: ["movimientos"] });

      agregarAlerta({
        type: "success",
        message: "Producción registrada con éxito",
      });
    },
    onError: (error) => {
      const mensaje = error.response?.data?.message || "Error al registrar producción";
    },
  });
};
