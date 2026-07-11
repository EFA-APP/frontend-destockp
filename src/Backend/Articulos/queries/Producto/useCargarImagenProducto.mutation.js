import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInitial } from "../../../Config";

const cargarImagenProducto = async ({ codigo, imagen }) => {
  const { data } = await axiosInitial.patch(
    `/producto/cargar-imagen?codigo=${codigo}`,
    { imagen }
  );
  return data;
};

export const useCargarImagenProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cargarImagenProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depositosConStock"] });
    },
  });
};
