import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CrearConfiguracionCamposApi } from "../../api/Producto/producto.api";

export const useCrearConfiguracion = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, params }) => CrearConfiguracionCamposApi(data, params),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["configuracion_producto"] });
      if (options.onSuccess) options.onSuccess(response);
    },
    ...options,
  });
};
